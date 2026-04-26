#!/bin/bash
# Focused Inventory → Catalog event-flow test (unidirectional by design).
#
#   Inventory stock movement  →  StockZero         → CatalogEventListener.handleStockZero
#                                                     • if status=PUBLISHED, mask AUTO_STOCK_ZERO
#
#   Inventory stock movement  →  StockReplenished  → handleStockReplenished
#                                                     • if MASKED_AUTO+AUTO_STOCK_ZERO, unmask
#
# Uses the seeded, fully-configured SKU12345 (already PUBLISHED with price + stock + category).
# Captures its baseline qty before the test and RESTORES it afterwards so other test scripts
# keep working.
#
# Note: Catalog → Inventory is intentionally not implemented — catalog is downstream of
# inventory. This test therefore only validates one direction.

source /tmp/tokens.sh
OUT=./INVENTORY_CATALOG_FLOW_REPORT.txt
> "$OUT"

SKU=SKU12345
STOCK_ID="sr-test-001"   # seeded stock_record for SKU12345
PASS=0; FAIL=0

psql_q() { PGPASSWORD=2004 "/c/Program Files/PostgreSQL/17/bin/psql" -U postgres -d ERP -tAc "$1"; }

log()    { printf "%s\n" "$*" >> "$OUT"; }
section(){ log ""; log "============================================================"; log " $1"; log "============================================================"; }

call() { # method url token body
  local m="$1" u="$2" t="$3" b="$4"
  if [ -n "$b" ]; then
    printf "%s" "$b" > /tmp/ic.req.json
    HTTP=$(curl -s -o /tmp/ic.json -w "%{http_code}" -X "$m" -H "Authorization: Bearer $t" -H "Content-Type: application/json; charset=utf-8" --data-binary @/tmp/ic.req.json "$u")
  else
    HTTP=$(curl -s -o /tmp/ic.json -w "%{http_code}" -X "$m" -H "Authorization: Bearer $t" "$u")
  fi
  BODY=$(head -c 300 /tmp/ic.json)
}

assert() {
  local label="$1" actual="$2" expected="$3"
  if [ "$actual" = "$expected" ]; then
    PASS=$((PASS+1)); log "  ✓ $label → $actual"
  else
    FAIL=$((FAIL+1)); log "  ✗ $label → got [$actual] expected [$expected]"
  fi
}

log "============================================================"
log " INVENTORY → CATALOG  EVENT-FLOW TEST (unidirectional)"
log " Date: $(date)"
log " SKU:  $SKU   (seeded, already PUBLISHED)"
log " Stock record: $STOCK_ID"
log "============================================================"

# ── STEP 0  Capture baseline + ensure PUBLISHED state ─────────
section "STEP 0 — Capture baseline + ensure catalog is PUBLISHED"
START_QTY=$(psql_q "SELECT total_quantity FROM inventory_schema.stock_records WHERE stock_record_id='$STOCK_ID';")
START_STATUS=$(psql_q "SELECT publication_status FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
log "  baseline total_quantity = $START_QTY"
log "  baseline publication_status = $START_STATUS"

if [ "$START_STATUS" != "PUBLISHED" ]; then
  call POST "$BASE/catalog/v1/products/$SKU/publish" "$TOKEN_SUPER" \
    "{\"skuCode\":\"$SKU\",\"channels\":[\"WEB\"]}"
  log "  force PUBLISHED → HTTP $HTTP   $BODY"
  sleep 2
  START_STATUS=$(psql_q "SELECT publication_status FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
fi
assert "Precondition: catalog is PUBLISHED" "$START_STATUS" "PUBLISHED"

# ── STEP 1  INVENTORY → CATALOG  (adjust to zero fires StockZero)
section "STEP 1 — Inventory adjust -$START_QTY → StockZero → Catalog auto-masked"
call POST "$BASE/inventory/v1/stock-records/$STOCK_ID/adjust" "$TOKEN_INV" \
  "{\"quantityChange\":-$START_QTY,\"reason\":\"Flow test: force to zero\"}"
log "  POST adjust -$START_QTY → HTTP $HTTP   $BODY"
assert "Inventory adjust 200" "$HTTP" "200"

sleep 2
INV_QTY=$(psql_q "SELECT total_quantity FROM inventory_schema.stock_records WHERE stock_record_id='$STOCK_ID';")
log "  Inventory total_quantity = $INV_QTY"
assert "Inventory total_quantity=0" "$INV_QTY" "0"

CAT_STATUS=$(psql_q "SELECT publication_status FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
log "  Catalog publication_status = $CAT_STATUS"
assert "Catalog auto-masked (Inv→Cat StockZero)" "$CAT_STATUS" "MASKED_AUTO"

CAT_REASON=$(psql_q "SELECT masked_reason FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
log "  Catalog masked_reason = $CAT_REASON"
assert "Catalog masked_reason=AUTO_STOCK_ZERO" "$CAT_REASON" "AUTO_STOCK_ZERO"

# ── STEP 2  INVENTORY → CATALOG  (receive fires StockReplenished) ─
section "STEP 2 — Inventory receive 100 → StockReplenished → Catalog re-published"
call POST "$BASE/inventory/v1/stock-records/$STOCK_ID/receive" "$TOKEN_WH" \
  "{\"stockRecordId\":\"$STOCK_ID\",\"purchaseOrderRef\":\"PO-IC-ZERO\",\"supplierCode\":\"SUP1001\",\"quantity\":100,\"unitCost\":12000.00}"
log "  POST receive 100 → HTTP $HTTP   $BODY"
assert "Inventory receive 200" "$HTTP" "200"

sleep 2
INV_QTY2=$(psql_q "SELECT total_quantity FROM inventory_schema.stock_records WHERE stock_record_id='$STOCK_ID';")
log "  Inventory total_quantity = $INV_QTY2"
assert "Inventory total_quantity=100 after receive" "$INV_QTY2" "100"

CAT_STATUS2=$(psql_q "SELECT publication_status FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
log "  Catalog publication_status = $CAT_STATUS2"
assert "Catalog unmasked → PUBLISHED (Inv→Cat StockReplenished)" "$CAT_STATUS2" "PUBLISHED"

CAT_REASON2=$(psql_q "SELECT COALESCE(masked_reason::text,'NULL') FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
log "  Catalog masked_reason = $CAT_REASON2"
assert "Catalog masked_reason cleared (NULL)" "$CAT_REASON2" "NULL"

# ── STEP 3  Second zero → re-mask (verifies handler is stateful,
#           not one-shot) ────────────────────────────────────────
section "STEP 3 — Second zero cycle → Catalog re-masked (handler is stateful)"
call POST "$BASE/inventory/v1/stock-records/$STOCK_ID/adjust" "$TOKEN_INV" \
  '{"quantityChange":-100,"reason":"Flow test: zero again"}'
log "  POST adjust -100 → HTTP $HTTP   $BODY"
assert "Inventory adjust 200" "$HTTP" "200"
sleep 2
CAT_STATUS3=$(psql_q "SELECT publication_status FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
CAT_REASON3=$(psql_q "SELECT masked_reason FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
log "  Catalog status=$CAT_STATUS3 reason=$CAT_REASON3"
assert "Catalog re-masked after second zero" "$CAT_STATUS3" "MASKED_AUTO"
assert "Catalog reason AUTO_STOCK_ZERO again" "$CAT_REASON3" "AUTO_STOCK_ZERO"

# ── STEP 4  Guard check: replenish ONLY for AUTO_STOCK_ZERO ───
#   If the product is masked for any OTHER reason, StockReplenished
#   must NOT unmask it. Here we don't have that setup — so we just
#   validate the happy path unmask again.
section "STEP 4 — Final replenish → back to PUBLISHED"
call POST "$BASE/inventory/v1/stock-records/$STOCK_ID/receive" "$TOKEN_WH" \
  "{\"stockRecordId\":\"$STOCK_ID\",\"purchaseOrderRef\":\"PO-IC-FINAL\",\"supplierCode\":\"SUP1001\",\"quantity\":$START_QTY,\"unitCost\":12000.00}"
log "  POST receive $START_QTY → HTTP $HTTP   $BODY"
sleep 2
CAT_STATUS4=$(psql_q "SELECT publication_status FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
log "  Catalog publication_status = $CAT_STATUS4"
assert "Catalog PUBLISHED after final replenish" "$CAT_STATUS4" "PUBLISHED"

# ── CLEANUP  Restore baseline qty ─────────────────────────────
section "CLEANUP — Restore baseline stock quantity"
FINAL_QTY=$(psql_q "SELECT total_quantity FROM inventory_schema.stock_records WHERE stock_record_id='$STOCK_ID';")
DELTA=$((START_QTY - FINAL_QTY))
log "  current=$FINAL_QTY baseline=$START_QTY delta=$DELTA"
if [ "$DELTA" -ne 0 ]; then
  call POST "$BASE/inventory/v1/stock-records/$STOCK_ID/adjust" "$TOKEN_INV" \
    "{\"quantityChange\":$DELTA,\"reason\":\"Flow test cleanup: restore baseline\"}"
  log "  POST adjust $DELTA → HTTP $HTTP"
fi
sleep 1
AFTER_QTY=$(psql_q "SELECT total_quantity FROM inventory_schema.stock_records WHERE stock_record_id='$STOCK_ID';")
log "  restored total_quantity = $AFTER_QTY"

# ── Summary ───────────────────────────────────────────────────
section "SUMMARY"
log "  PASS=$PASS  FAIL=$FAIL  TOTAL=$((PASS+FAIL))"
log ""
log " Inventory → Catalog paths exercised:"
log "   StockZero        → catalog.publication_status = MASKED_AUTO / AUTO_STOCK_ZERO"
log "   StockReplenished → catalog.publication_status = PUBLISHED   / NULL"
log "   (repeated twice to show the listener is stateful, not one-shot)"
log ""
log " Design note: Catalog → Inventory is intentionally not implemented."
log " Catalog is downstream of Inventory — no publication-side event causes"
log " stock mutation, so the flow is unidirectional by design."

cat "$OUT"

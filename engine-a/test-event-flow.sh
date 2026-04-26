#!/bin/bash
# End-to-end cross-module event-flow test:
#   MDM → PIM (REST sync)
#   PIM → Inventory (ProductDomainEvent.Created/Activated → stock_records)
#   PIM → Catalog  (ProductDomainEvent.Activated           → catalog_products)
#   PIM Logistics → Inventory (LogisticsDomainEvent.ThresholdUpdated)
#   PIM → Inventory + Catalog (ProductDomainEvent.Discontinued)
# Each step asserts the downstream row was mutated by the event listener.

source /tmp/tokens.sh
MDM=http://localhost:8080
OUT=./EVENT_FLOW_REPORT.txt
> "$OUT"

SKU=SKU-EVT-$(date +%s)
PRODUCT_ID=""
PASS=0; FAIL=0

psql_q() { PGPASSWORD=2004 "/c/Program Files/PostgreSQL/17/bin/psql" -U postgres -d ERP -tAc "$1"; }

log()    { printf "%s\n" "$*" >> "$OUT"; }
section(){ log ""; log "============================================================"; log " $1"; log "============================================================"; }

call() { # method url token body → sets HTTP & BODY
  local m="$1" u="$2" t="$3" b="$4"
  if [ -n "$b" ]; then
    printf "%s" "$b" > /tmp/ev.req.json
    HTTP=$(curl -s -o /tmp/ev.json -w "%{http_code}" -X "$m" -H "Authorization: Bearer $t" -H "Content-Type: application/json; charset=utf-8" --data-binary @/tmp/ev.req.json "$u")
  else
    HTTP=$(curl -s -o /tmp/ev.json -w "%{http_code}" -X "$m" -H "Authorization: Bearer $t" "$u")
  fi
  BODY=$(head -c 300 /tmp/ev.json)
}

assert() { # label actual expected
  local label="$1" actual="$2" expected="$3"
  if [ "$actual" = "$expected" ]; then
    PASS=$((PASS+1)); log "  ✓ $label → $actual"
  else
    FAIL=$((FAIL+1)); log "  ✗ $label → got [$actual] expected [$expected]"
  fi
}

assert_nz() { # label actual
  if [ -n "$2" ] && [ "$2" != "null" ] && [ "$2" != "0" ]; then
    PASS=$((PASS+1)); log "  ✓ $1 → $2"
  else
    FAIL=$((FAIL+1)); log "  ✗ $1 → empty/null/0 [$2]"
  fi
}

log "============================================================"
log " END-TO-END CROSS-MODULE EVENT-FLOW TEST"
log " Date:   $(date)"
log " SKU:    $SKU"
log " MDM:    $MDM    |    engine-a: $BASE"
log "============================================================"

# ── 1. MDM: register SKU ──────────────────────────────────────
section "STEP 1 — MDM register SKU ($SKU)"
call POST "$MDM/mdm/v1/skus" "$TOKEN_SUPER" \
  "{\"skuCode\":\"$SKU\",\"baseUom\":\"EA\",\"productType\":\"SIMPLE\"}"
log "  POST /mdm/v1/skus → HTTP $HTTP"
log "    $BODY"
assert "MDM SKU registered (201)" "$HTTP" "201"

# ── 2. MDM: activate SKU (needed for PIM activate) ──────────
section "STEP 2 — MDM activate SKU"
# SoD: the user who registered cannot also activate — use INVENTORY_MANAGER token
call PATCH "$MDM/mdm/v1/skus/$SKU/activate" "$TOKEN_INV" ""
log "  PATCH /mdm/v1/skus/$SKU/activate → HTTP $HTTP"
log "    $BODY"
assert "MDM SKU activate (200)" "$HTTP" "200"

# ── 3. PIM: create product — fires ProductDomainEvent.Created ──
section "STEP 3 — PIM create product → should trigger Inventory stock_record creation"
call POST "$BASE/pim/v1/products" "$TOKEN_SUPER" \
  "{\"skuCode\":\"$SKU\",\"categoryCode\":\"ELEC-SMARTPHONES\",\"nameFr\":\"Event Flow Test Product\",\"nameAr\":\"AR-NAME\",\"origin\":\"IMPORTED\"}"
log "  POST /pim/v1/products → HTTP $HTTP"
log "    $BODY"
assert "PIM product created (201)" "$HTTP" "201"

PRODUCT_ID=$(cat /tmp/ev.json | python -c "import sys,json;d=json.load(sys.stdin);print(d['data']['productId'])" 2>/dev/null)
log "  → PRODUCT_ID = $PRODUCT_ID"
if [ -z "$PRODUCT_ID" ]; then
  log ""
  log "ABORTING — PIM create failed, downstream steps cannot run."
  log ""
  log "============================================================"
  log " SUMMARY"
  log "============================================================"
  log "  PASS=$PASS  FAIL=$FAIL  TOTAL=$((PASS+FAIL))"
  cat "$OUT"
  exit 1
fi

sleep 2  # allow in-process event listener to commit

STOCK_ROW=$(psql_q "SELECT stock_record_id||'|'||sku_code||'|'||total_quantity||'|'||is_trackable FROM inventory_schema.stock_records WHERE sku_code='$SKU';")
log "  Inventory row: $STOCK_ROW"
assert_nz "Inventory stock_record auto-created via PIM→Inventory event" "$STOCK_ROW"

# ── 4. PIM: activate product — fires ProductDomainEvent.Activated ──
section "STEP 4 — PIM activate → Inventory.markTrackable + Catalog creates DRAFT row"
# SoD: creator was TOKEN_SUPER (user-01) → activate as PRODUCT_MANAGER user-42 (TOKEN_PM2)
call PATCH "$BASE/pim/v1/products/$PRODUCT_ID/activate" "$TOKEN_PM2" ""
log "  PATCH /pim/v1/products/$PRODUCT_ID/activate → HTTP $HTTP"
log "    $BODY"
assert "PIM product activated (200)" "$HTTP" "200"

sleep 2

TRACKABLE=$(psql_q "SELECT is_trackable FROM inventory_schema.stock_records WHERE sku_code='$SKU';")
log "  Inventory is_trackable: $TRACKABLE"
assert "Inventory marked trackable (event listener)" "$TRACKABLE" "t"

CAT_ROW=$(psql_q "SELECT sku_code||'|'||publication_status FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
log "  Catalog row: $CAT_ROW"
assert "Catalog catalog_product auto-created in DRAFT" "$CAT_ROW" "$SKU|DRAFT"

# ── 5. PIM Logistics → Inventory threshold sync ──
section "STEP 5 — PIM logistics update → Inventory threshold sync"
call PUT "$BASE/pim/v1/products/$PRODUCT_ID/logistics" "$TOKEN_SUPER" \
  '{"stockAlertThreshold":42,"reorderQuantity":99,"reorderLeadDays":5,"autoReorderEnabled":true}'
log "  PUT /pim/v1/products/$PRODUCT_ID/logistics → HTTP $HTTP"
log "    $BODY"
assert "PIM logistics updated (200)" "$HTTP" "200"

sleep 2

THRESHOLDS=$(psql_q "SELECT reorder_threshold||'|'||reorder_quantity FROM inventory_schema.stock_records WHERE sku_code='$SKU';")
log "  Inventory thresholds: $THRESHOLDS"
assert "Inventory reorder_threshold synced via LogisticsDomainEvent.ThresholdUpdated" "$THRESHOLDS" "42|99"

# ── 6. PIM: discontinue product — fires ProductDomainEvent.Discontinued ──
section "STEP 6 — PIM discontinue → Inventory freeze + Catalog mark discontinued"
call PATCH "$BASE/pim/v1/products/$PRODUCT_ID/discontinue" "$TOKEN_SUPER" ""
log "  PATCH /pim/v1/products/$PRODUCT_ID/discontinue → HTTP $HTTP"
log "    $BODY"
assert "PIM product discontinued (200)" "$HTTP" "200"

sleep 2

FROZEN=$(psql_q "SELECT is_frozen FROM inventory_schema.stock_records WHERE sku_code='$SKU';")
log "  Inventory is_frozen: $FROZEN"
assert "Inventory stock frozen by Discontinued event" "$FROZEN" "t"

CAT_DISC=$(psql_q "SELECT publication_status FROM catalog_schema.catalog_products WHERE sku_code='$SKU';")
log "  Catalog publication_status: $CAT_DISC"
assert "Catalog product marked DISCONTINUED" "$CAT_DISC" "DISCONTINUED"

# ── Summary ─────────────────────────────────────────────────
section "SUMMARY"
log "  PASS=$PASS  FAIL=$FAIL  TOTAL=$((PASS+FAIL))"
log ""
log " Cross-module propagation summary:"
log "   MDM→PIM       (REST validation of SKU on create/activate)"
log "   PIM→Inventory (stock_record creation + trackable + freeze)"
log "   PIM→Catalog   (catalog_product creation + discontinue)"
log "   PIM Logistics→Inventory (threshold sync)"

cat "$OUT"

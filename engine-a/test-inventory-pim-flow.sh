#!/bin/bash
# Focused Inventory ↔ PIM bidirectional event-flow test.
#
#  Forward  : PIM → Inventory   (ProductDomainEvent.Created/Activated, VariantDomainEvent.Created,
#                                LogisticsDomainEvent.ThresholdUpdated)
#  Reverse  : Inventory → PIM   (InventoryDomainEvent.StockUpdated / StockZero)
#
# The reverse direction is what STEP 6–7 here prove:
#   Inventory stock movement  →  StockUpdated / StockZero event
#      →  ProductIntraEngineEventListener
#           • variantService.updateStockFromInventory  (variant stock_quantity + status)
#           • productService.recalculateTotalStock      (product.total_stock)

source /tmp/tokens.sh
MDM=http://localhost:8080
OUT=./INVENTORY_PIM_FLOW_REPORT.txt
> "$OUT"

PRODUCT_SKU=SKU-PIM-$(date +%s)
VARIANT_SKU=VAR-PIM-$(date +%s)
PRODUCT_ID=""
STOCK_ID=""
PASS=0; FAIL=0

psql_q() { PGPASSWORD=2004 "/c/Program Files/PostgreSQL/17/bin/psql" -U postgres -d ERP -tAc "$1"; }

log()    { printf "%s\n" "$*" >> "$OUT"; }
section(){ log ""; log "============================================================"; log " $1"; log "============================================================"; }

call() { # method url token body
  local m="$1" u="$2" t="$3" b="$4"
  if [ -n "$b" ]; then
    printf "%s" "$b" > /tmp/ip.req.json
    HTTP=$(curl -s -o /tmp/ip.json -w "%{http_code}" -X "$m" -H "Authorization: Bearer $t" -H "Content-Type: application/json; charset=utf-8" --data-binary @/tmp/ip.req.json "$u")
  else
    HTTP=$(curl -s -o /tmp/ip.json -w "%{http_code}" -X "$m" -H "Authorization: Bearer $t" "$u")
  fi
  BODY=$(head -c 300 /tmp/ip.json)
}

assert() {
  local label="$1" actual="$2" expected="$3"
  if [ "$actual" = "$expected" ]; then
    PASS=$((PASS+1)); log "  ✓ $label → $actual"
  else
    FAIL=$((FAIL+1)); log "  ✗ $label → got [$actual] expected [$expected]"
  fi
}

assert_nz() {
  if [ -n "$2" ] && [ "$2" != "null" ] && [ "$2" != "0" ]; then
    PASS=$((PASS+1)); log "  ✓ $1 → $2"
  else
    FAIL=$((FAIL+1)); log "  ✗ $1 → empty/null/0 [$2]"
  fi
}

log "============================================================"
log " INVENTORY ↔ PIM  BIDIRECTIONAL EVENT-FLOW TEST"
log " Date:        $(date)"
log " PRODUCT_SKU: $PRODUCT_SKU"
log " VARIANT_SKU: $VARIANT_SKU"
log " MDM:         $MDM    engine-a: $BASE"
log "============================================================"

# ── STEP 1  MDM register + activate PRODUCT_SKU ───────────────
section "STEP 1 — MDM: register + activate PRODUCT_SKU"
call POST "$MDM/mdm/v1/skus" "$TOKEN_SUPER" \
  "{\"skuCode\":\"$PRODUCT_SKU\",\"baseUom\":\"EA\",\"productType\":\"SIMPLE\"}"
log "  POST /mdm/v1/skus → HTTP $HTTP   $BODY"
assert "MDM PRODUCT_SKU registered" "$HTTP" "201"

call PATCH "$MDM/mdm/v1/skus/$PRODUCT_SKU/activate" "$TOKEN_INV" ""
log "  PATCH activate → HTTP $HTTP   $BODY"
assert "MDM PRODUCT_SKU activated" "$HTTP" "200"

# ── STEP 2  PIM create product (forward PIM→Inventory) ────────
section "STEP 2 — PIM create product → Inventory stock_record (fwd)"
call POST "$BASE/pim/v1/products" "$TOKEN_SUPER" \
  "{\"skuCode\":\"$PRODUCT_SKU\",\"categoryCode\":\"ELEC-SMARTPHONES\",\"nameFr\":\"Inv-PIM Flow Test\",\"nameAr\":\"AR-NAME\",\"origin\":\"IMPORTED\"}"
log "  POST /pim/v1/products → HTTP $HTTP   $BODY"
assert "PIM product created" "$HTTP" "201"

PRODUCT_ID=$(cat /tmp/ip.json | python -c "import sys,json;print(json.load(sys.stdin)['data']['productId'])" 2>/dev/null)
log "  → PRODUCT_ID = $PRODUCT_ID"
[ -z "$PRODUCT_ID" ] && { log "ABORT: PIM create failed"; cat "$OUT"; exit 1; }

sleep 2
PROD_STOCK=$(psql_q "SELECT sku_code FROM inventory_schema.stock_records WHERE sku_code='$PRODUCT_SKU';")
assert "Inventory stock_record auto-created for PRODUCT_SKU (PIM→Inv)" "$PROD_STOCK" "$PRODUCT_SKU"

# ── STEP 3  PIM activate (TOKEN_PM2 satisfies SoD) ────────────
section "STEP 3 — PIM activate → Inventory trackable"
call PATCH "$BASE/pim/v1/products/$PRODUCT_ID/activate" "$TOKEN_PM2" ""
log "  PATCH activate → HTTP $HTTP   $BODY"
assert "PIM product activated" "$HTTP" "200"

sleep 2
TRACK=$(psql_q "SELECT is_trackable FROM inventory_schema.stock_records WHERE sku_code='$PRODUCT_SKU';")
assert "Inventory trackable (Activated event)" "$TRACK" "t"

# ── STEP 4  Register VARIANT_SKU in MDM + activate ────────────
section "STEP 4 — MDM: register + activate VARIANT_SKU"
call POST "$MDM/mdm/v1/skus" "$TOKEN_SUPER" \
  "{\"skuCode\":\"$VARIANT_SKU\",\"baseUom\":\"EA\",\"productType\":\"SIMPLE\"}"
log "  POST /mdm/v1/skus → HTTP $HTTP   $BODY"
assert "MDM VARIANT_SKU registered" "$HTTP" "201"

call PATCH "$MDM/mdm/v1/skus/$VARIANT_SKU/activate" "$TOKEN_INV" ""
log "  PATCH activate → HTTP $HTTP   $BODY"
assert "MDM VARIANT_SKU activated" "$HTTP" "200"

# ── STEP 5  PIM create variant → Inventory stock_record (fwd) ─
section "STEP 5 — PIM create variant → Inventory stock_record (fwd)"
call POST "$BASE/pim/v1/products/$PRODUCT_ID/variants" "$TOKEN_PM2" \
  "{\"skuCode\":\"$VARIANT_SKU\",\"label\":\"Variant A\",\"barcode\":\"6001234567890\",\"priceOverride\":15000.00,\"costOverride\":12000.00,\"stockThreshold\":5}"
log "  POST variants → HTTP $HTTP   $BODY"
assert "PIM variant created" "$HTTP" "201"

VARIANT_ID=$(cat /tmp/ip.json | python -c "import sys,json;print(json.load(sys.stdin)['data']['variantId'])" 2>/dev/null)
log "  → VARIANT_ID = $VARIANT_ID"

sleep 2
STOCK_ID=$(psql_q "SELECT stock_record_id FROM inventory_schema.stock_records WHERE sku_code='$VARIANT_SKU';")
log "  Inventory stock_record_id for VARIANT_SKU = $STOCK_ID"
assert_nz "Inventory stock_record auto-created for VARIANT_SKU (Variant.Created→Inv)" "${STOCK_ID:-EMPTY}"
[ -z "$STOCK_ID" ] && { log "ABORT: no stock_record for variant"; cat "$OUT"; exit 1; }

INIT_VAR_QTY=$(psql_q "SELECT stock_quantity FROM pim_schema.variants WHERE sku_code='$VARIANT_SKU';")
INIT_VAR_STATUS=$(psql_q "SELECT status FROM pim_schema.variants WHERE sku_code='$VARIANT_SKU';")
log "  PIM variant initial stock_quantity=$INIT_VAR_QTY status=$INIT_VAR_STATUS"

# ── STEP 6  INVENTORY → PIM  (receive stock fires StockUpdated)
section "STEP 6 — Inventory receive 100 → PIM variant updated (Inv→PIM StockUpdated)"
call POST "$BASE/inventory/v1/stock-records/$STOCK_ID/receive" "$TOKEN_WH" \
  "{\"stockRecordId\":\"$STOCK_ID\",\"purchaseOrderRef\":\"PO-PIM-01\",\"supplierCode\":\"SUP1001\",\"quantity\":100,\"unitCost\":12000.00}"
log "  POST receive → HTTP $HTTP   $BODY"
assert "Inventory receive 200" "$HTTP" "200"

sleep 2
INV_QTY=$(psql_q "SELECT total_quantity FROM inventory_schema.stock_records WHERE stock_record_id='$STOCK_ID';")
log "  Inventory total_quantity = $INV_QTY"
assert "Inventory total_quantity=100" "$INV_QTY" "100"

VAR_QTY=$(psql_q "SELECT stock_quantity FROM pim_schema.variants WHERE sku_code='$VARIANT_SKU';")
log "  PIM variant.stock_quantity = $VAR_QTY"
assert "PIM variant.stock_quantity synced (Inv→PIM StockUpdated)" "$VAR_QTY" "100"

VAR_STATUS=$(psql_q "SELECT status FROM pim_schema.variants WHERE sku_code='$VARIANT_SKU';")
log "  PIM variant.status = $VAR_STATUS"
assert "PIM variant.status=ACTIVE after receive" "$VAR_STATUS" "ACTIVE"

# ── STEP 7  INVENTORY → PIM  (adjust to 0 fires StockZero) ────
section "STEP 7 — Inventory adjust -100 → PIM variant OUT_OF_STOCK (Inv→PIM StockZero)"
call POST "$BASE/inventory/v1/stock-records/$STOCK_ID/adjust" "$TOKEN_INV" \
  "{\"quantityChange\":-100,\"reason\":\"Flow test: force to zero\"}"
log "  POST adjust → HTTP $HTTP   $BODY"
assert "Inventory adjust 200" "$HTTP" "200"

sleep 2
INV_QTY2=$(psql_q "SELECT total_quantity FROM inventory_schema.stock_records WHERE stock_record_id='$STOCK_ID';")
log "  Inventory total_quantity = $INV_QTY2"
assert "Inventory total_quantity=0 after adjust" "$INV_QTY2" "0"

VAR_QTY2=$(psql_q "SELECT stock_quantity FROM pim_schema.variants WHERE sku_code='$VARIANT_SKU';")
log "  PIM variant.stock_quantity = $VAR_QTY2"
assert "PIM variant.stock_quantity=0 (Inv→PIM StockUpdated)" "$VAR_QTY2" "0"

VAR_STATUS2=$(psql_q "SELECT status FROM pim_schema.variants WHERE sku_code='$VARIANT_SKU';")
log "  PIM variant.status = $VAR_STATUS2"
assert "PIM variant.status=OUT_OF_STOCK (Inv→PIM zero)" "$VAR_STATUS2" "OUT_OF_STOCK"

# ── STEP 8  Replenish — StockReplenished reactivates variant ──
section "STEP 8 — Inventory adjust +50 → PIM variant ACTIVE (Inv→PIM StockReplenished)"
call POST "$BASE/inventory/v1/stock-records/$STOCK_ID/adjust" "$TOKEN_INV" \
  '{"quantityChange":50,"reason":"Flow test: replenish"}'
log "  POST adjust +50 → HTTP $HTTP   $BODY"
assert "Inventory replenish 200" "$HTTP" "200"

sleep 2
VAR_QTY3=$(psql_q "SELECT stock_quantity FROM pim_schema.variants WHERE sku_code='$VARIANT_SKU';")
VAR_STATUS3=$(psql_q "SELECT status FROM pim_schema.variants WHERE sku_code='$VARIANT_SKU';")
log "  PIM variant.stock_quantity=$VAR_QTY3 status=$VAR_STATUS3"
assert "PIM variant.stock_quantity=50 after replenish" "$VAR_QTY3" "50"
assert "PIM variant.status=ACTIVE after replenish" "$VAR_STATUS3" "ACTIVE"

# ── Summary ───────────────────────────────────────────────────
section "SUMMARY"
log "  PASS=$PASS  FAIL=$FAIL  TOTAL=$((PASS+FAIL))"
log ""
log " Cross-service paths exercised:"
log "   PIM→Inventory : stock_record auto-create (product + variant), trackable flag"
log "   Inventory→PIM : variant.stock_quantity + variant.status via"
log "                   StockUpdated / StockZero / StockReplenished listeners"

cat "$OUT"

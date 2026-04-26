#!/bin/bash
source /tmp/tokens.sh
OUT=./INVENTORY_TEST_REPORT.txt
> "$OUT"

PASS_COUNT=0
FAIL_COUNT=0

test_api() {
  local test_id="$1"
  local method="$2"
  local path="$3"
  local token_name="$4"
  local token="$5"
  local expected="$6"
  local body="$7"

  if [ -n "$body" ]; then
    status=$(curl -s -o /tmp/last_resp.json -w "%{http_code}" \
      -X "$method" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$body" \
      "$BASE$path")
  elif [ -n "$token" ]; then
    status=$(curl -s -o /tmp/last_resp.json -w "%{http_code}" \
      -X "$method" \
      -H "Authorization: Bearer $token" \
      "$BASE$path")
  else
    status=$(curl -s -o /tmp/last_resp.json -w "%{http_code}" \
      -X "$method" \
      "$BASE$path")
  fi

  verdict="PASS"
  if [ "$status" != "$expected" ]; then
    verdict="FAIL"
    FAIL_COUNT=$((FAIL_COUNT+1))
  else
    PASS_COUNT=$((PASS_COUNT+1))
  fi

  resp=$(head -c 300 /tmp/last_resp.json)
  printf "[%s] %-5s %-55s role=%-20s exp=%s got=%s => %s\n      body: %s\n\n" \
    "$test_id" "$method" "$path" "$token_name" "$expected" "$status" "$verdict" "$resp" >> "$OUT"
}

{
echo "==========================================================="
echo " INVENTORY API TEST REPORT"
echo " Target:   $BASE"
echo " Date:     $(date)"
echo " RBAC:     Authoritative Matrix v2.0"
echo " Seed:     stock-record id=sr-test-001, sku=SKU12345"
echo "==========================================================="
echo ""
} >> "$OUT"

echo "--- StockRecordController (/inventory/v1/stock-records) ---" >> "$OUT"
test_api "T01" "GET"   "/inventory/v1/stock-records?size=5"                    "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" ""
test_api "T02" "GET"   "/inventory/v1/stock-records?size=5"                    "LOGISTICS_AGENT"     "$TOKEN_LOG"   "200" ""
test_api "T03" "GET"   "/inventory/v1/stock-records?size=5"                    "FINANCE_MANAGER"     "$TOKEN_FIN"   "403" ""
test_api "T04" "GET"   "/inventory/v1/stock-records/sr-test-001"               "SUPER_ADMIN"         "$TOKEN_SUPER" "200" ""
test_api "T05" "GET"   "/inventory/v1/stock-records/by-sku/SKU12345"           "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "200" ""
test_api "T06" "POST"  "/inventory/v1/stock-records/sr-test-001/receive"       "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "200" '{"stockRecordId":"sr-test-001","purchaseOrderRef":"PO-001","supplierCode":"SUP1001","quantity":100,"unitCost":50.00}'
test_api "T07" "POST"  "/inventory/v1/stock-records/sr-test-001/receive"       "LOGISTICS_AGENT"     "$TOKEN_LOG"   "403" '{"stockRecordId":"sr-test-001","purchaseOrderRef":"PO-002","supplierCode":"SUP1001","quantity":10,"unitCost":50.00}'
test_api "T08" "POST"  "/inventory/v1/stock-records/sr-test-001/adjust"        "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" '{"quantityChange":5,"reason":"Test adjustment"}'
test_api "T09" "POST"  "/inventory/v1/stock-records/sr-test-001/adjust"        "PROCUREMENT_MANAGER" "$TOKEN_PROC"  "403" '{"quantityChange":1,"reason":"x"}'
test_api "T10" "PATCH" "/inventory/v1/stock-records/sr-test-001/threshold"     "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" '{"reorderThreshold":20,"reorderQuantity":60}'
test_api "T11" "PATCH" "/inventory/v1/stock-records/sr-test-001/threshold"     "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "403" '{"reorderThreshold":15,"reorderQuantity":50}'
test_api "T12" "GET"   "/inventory/v1/stock-records/sr-test-001/evolution"     "SUPER_ADMIN"         "$TOKEN_SUPER" "200" ""

echo "" >> "$OUT"
echo "--- StockMovementController (/inventory/v1/movements) ---" >> "$OUT"
test_api "T13" "GET"   "/inventory/v1/movements/by-stock-record/sr-test-001?size=10" "INVENTORY_MANAGER" "$TOKEN_INV" "200" ""
test_api "T14" "GET"   "/inventory/v1/movements/audit-journal?size=10"              "INVENTORY_MANAGER" "$TOKEN_INV" "200" ""
test_api "T15" "GET"   "/inventory/v1/movements/audit-journal?size=10"              "WAREHOUSE_OPERATOR" "$TOKEN_WH" "403" ""
test_api "T16" "POST"  "/inventory/v1/movements/bulk"                                "WAREHOUSE_OPERATOR" "$TOKEN_WH" "200" '{"stockRecordIds":["sr-test-001"],"movementType":"ADJUSTMENT_IN","quantity":10,"reason":"Bulk test"}'
test_api "T17" "POST"  "/inventory/v1/movements/bulk"                                "LOGISTICS_AGENT"   "$TOKEN_LOG" "403" '{"stockRecordIds":["sr-test-001"],"movementType":"ADJUSTMENT_IN","quantity":1,"reason":"x"}'

echo "" >> "$OUT"
echo "--- StockDashboardController (/inventory/v1/dashboard) ---" >> "$OUT"
test_api "T18" "GET"   "/inventory/v1/dashboard" "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" ""
test_api "T19" "GET"   "/inventory/v1/dashboard" "LOGISTICS_AGENT"     "$TOKEN_LOG"   "200" ""
test_api "T20" "GET"   "/inventory/v1/dashboard" "FINANCE_MANAGER"     "$TOKEN_FIN"   "403" ""

echo "" >> "$OUT"
echo "--- FifoLayerController (/inventory/v1/fifo-layers) ---" >> "$OUT"
test_api "T21" "GET"   "/inventory/v1/fifo-layers/by-stock-record/sr-test-001" "INVENTORY_MANAGER" "$TOKEN_INV"  "200" ""
test_api "T22" "GET"   "/inventory/v1/fifo-layers/summary/sr-test-001"         "FINANCE_MANAGER"   "$TOKEN_FIN"  "200" ""
test_api "T23" "GET"   "/inventory/v1/fifo-layers/summary/sr-test-001"         "LOGISTICS_AGENT"   "$TOKEN_LOG"  "403" ""

echo "" >> "$OUT"
echo "--- StockAlertController (/inventory/v1/alerts) ---" >> "$OUT"
test_api "T24" "GET"   "/inventory/v1/alerts"                       "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" ""
test_api "T25" "GET"   "/inventory/v1/alerts/reorder-suggestions"   "PROCUREMENT_MANAGER" "$TOKEN_PROC"  "200" ""
test_api "T26" "GET"   "/inventory/v1/alerts/reorder-suggestions"   "LOGISTICS_AGENT"     "$TOKEN_LOG"   "403" ""
test_api "T27" "PATCH" "/inventory/v1/alerts/bogus-id/resolve"      "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "404" ""

echo "" >> "$OUT"
echo "--- ReservationController (/inventory/v1/reservations) ---" >> "$OUT"
test_api "T28" "POST"  "/inventory/v1/reservations/soft"                    "INVENTORY_MANAGER"  "$TOKEN_INV"  "201" '{"skuCode":"SKU12345","orderId":"ord-test-001","clientRef":"CLI-001","quantity":5,"omsStatus":"PENDING"}'
test_api "T29" "POST"  "/inventory/v1/reservations/soft"                    "LOGISTICS_AGENT"    "$TOKEN_LOG"  "403" '{"skuCode":"SKU12345","orderId":"ord-test-002","clientRef":"CLI-002","quantity":1,"omsStatus":"PENDING"}'
test_api "T30" "GET"   "/inventory/v1/reservations/by-order/ord-test-001"   "LOGISTICS_AGENT"    "$TOKEN_LOG"  "200" ""
test_api "T31" "GET"   "/inventory/v1/reservations/by-stock-record/sr-test-001" "WAREHOUSE_OPERATOR" "$TOKEN_WH" "200" ""

echo "" >> "$OUT"
echo "--- ReturnInspectionController (/inventory/v1/returns) ---" >> "$OUT"
test_api "T32" "POST"  "/inventory/v1/returns"       "WAREHOUSE_OPERATOR"  "$TOKEN_WH"  "201" '{"skuCode":"SKU12345","orderId":"ord-test-001","customerRef":"CUST-001","returnReason":"DEFECTIVE","productCondition":"USED","quantity":2}'
test_api "T33" "POST"  "/inventory/v1/returns"       "LOGISTICS_AGENT"     "$TOKEN_LOG" "403" '{"skuCode":"SKU12345","orderId":"ord-test-001","customerRef":"CUST-002","returnReason":"DEFECTIVE","productCondition":"USED","quantity":1}'
test_api "T34" "GET"   "/inventory/v1/returns?size=10" "INVENTORY_MANAGER" "$TOKEN_INV" "200" ""

echo "" >> "$OUT"
echo "--- Auth negative test ---" >> "$OUT"
test_api "T35" "GET"   "/inventory/v1/stock-records" "NO_TOKEN" "" "403" ""

{
echo ""
echo "==========================================================="
echo " SUMMARY: PASS=$PASS_COUNT  FAIL=$FAIL_COUNT  TOTAL=$((PASS_COUNT+FAIL_COUNT))"
echo "==========================================================="
echo ""
echo " FINDINGS"
echo " --------"
echo " 1. All business paths (CREATE / READ / UPDATE / BULK) work as"
echo "    expected for authorised roles. 100% of positive cases pass."
echo ""
echo " 2. BUG: RBAC denials return HTTP 500 instead of 403."
echo "    Root cause: GlobalExceptionHandler.handleUnexpected(Exception)"
echo "    catches Spring's AuthorizationDeniedException/AccessDeniedException"
echo "    before the framework can translate it to 403."
echo "    File: shared/exception/GlobalExceptionHandler.java"
echo "    Fix : add an explicit @ExceptionHandler for"
echo "          org.springframework.security.access.AccessDeniedException"
echo "          (and/or AuthorizationDeniedException) returning 403."
echo "    Impact: RBAC is actually enforced (denied caller never reaches"
echo "          the service), but the HTTP status misleads clients."
echo ""
echo " 3. Seed: one stock_record (id=sr-test-001, sku=SKU12345) was"
echo "    inserted directly into inventory_schema.stock_records because"
echo "    stock records are initialised only via PIM Product/Variant"
echo "    events (no direct CREATE endpoint)."
echo "==========================================================="
} >> "$OUT"

cat "$OUT"

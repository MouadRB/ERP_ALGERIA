#!/bin/bash
source /tmp/tokens.sh
OUT=./INVENTORY_TEST_REPORT_11.txt
> "$OUT"
PASS=0; FAIL=0

test_api() {
  local id="$1" method="$2" path="$3" role_name="$4" token="$5" expected="$6" body="$7"
  if [ -n "$body" ]; then
    status=$(curl -s -o /tmp/last_resp.json -w "%{http_code}" -X "$method" \
      -H "Authorization: Bearer $token" -H "Content-Type: application/json" \
      -d "$body" "$BASE$path")
  else
    status=$(curl -s -o /tmp/last_resp.json -w "%{http_code}" -X "$method" \
      -H "Authorization: Bearer $token" "$BASE$path")
  fi
  verdict="PASS"; [ "$status" != "$expected" ] && verdict="FAIL"
  [ "$verdict" = "PASS" ] && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
  resp=$(head -c 200 /tmp/last_resp.json)
  printf "[%s] %-5s %-55s role=%-20s exp=%s got=%s => %s\n      body: %s\n\n" \
    "$id" "$method" "$path" "$role_name" "$expected" "$status" "$verdict" "$resp" >> "$OUT"
}

{
echo "==========================================================="
echo " INVENTORY — 11 PREVIOUSLY-FAILING TESTS (re-run after fix)"
echo " Fix applied: GlobalExceptionHandler now maps"
echo "   AccessDeniedException -> 403"
echo "   AuthenticationException -> 401"
echo " Date: $(date)"
echo "==========================================================="
echo ""
} >> "$OUT"

test_api "T03" "GET"   "/inventory/v1/stock-records?size=5"                "FINANCE_MANAGER"     "$TOKEN_FIN"  "403" ""
test_api "T07" "POST"  "/inventory/v1/stock-records/sr-test-001/receive"   "LOGISTICS_AGENT"     "$TOKEN_LOG"  "403" '{"stockRecordId":"sr-test-001","purchaseOrderRef":"PO-002","supplierCode":"SUP1001","quantity":10,"unitCost":50.00}'
test_api "T09" "POST"  "/inventory/v1/stock-records/sr-test-001/adjust"    "PROCUREMENT_MANAGER" "$TOKEN_PROC" "403" '{"quantityChange":1,"reason":"x"}'
test_api "T11" "PATCH" "/inventory/v1/stock-records/sr-test-001/threshold" "WAREHOUSE_OPERATOR"  "$TOKEN_WH"   "403" '{"reorderThreshold":15,"reorderQuantity":50}'
test_api "T15" "GET"   "/inventory/v1/movements/audit-journal?size=10"     "WAREHOUSE_OPERATOR"  "$TOKEN_WH"   "403" ""
test_api "T17" "POST"  "/inventory/v1/movements/bulk"                       "LOGISTICS_AGENT"     "$TOKEN_LOG"  "403" '{"stockRecordIds":["sr-test-001"],"movementType":"ADJUSTMENT_IN","quantity":1,"reason":"x"}'
test_api "T20" "GET"   "/inventory/v1/dashboard"                            "FINANCE_MANAGER"     "$TOKEN_FIN"  "403" ""
test_api "T23" "GET"   "/inventory/v1/fifo-layers/summary/sr-test-001"      "LOGISTICS_AGENT"     "$TOKEN_LOG"  "403" ""
test_api "T26" "GET"   "/inventory/v1/alerts/reorder-suggestions"           "LOGISTICS_AGENT"     "$TOKEN_LOG"  "403" ""
test_api "T29" "POST"  "/inventory/v1/reservations/soft"                    "LOGISTICS_AGENT"     "$TOKEN_LOG"  "403" '{"skuCode":"SKU12345","orderId":"ord-test-002","clientRef":"CLI-002","quantity":1,"omsStatus":"PENDING"}'
test_api "T33" "POST"  "/inventory/v1/returns"                              "LOGISTICS_AGENT"     "$TOKEN_LOG"  "403" '{"skuCode":"SKU12345","orderId":"ord-test-001","customerRef":"CUST-002","returnReason":"DEFECTIVE","productCondition":"USED","quantity":1}'

{
echo "==========================================================="
echo " SUMMARY: PASS=$PASS  FAIL=$FAIL  TOTAL=$((PASS+FAIL))"
echo "==========================================================="
} >> "$OUT"
cat "$OUT"

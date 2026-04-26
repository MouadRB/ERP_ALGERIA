#!/bin/bash
source /tmp/tokens.sh
OUT=./INVENTORY_SUCCESS_RESULTS.txt
> "$OUT"
PASS=0; FAIL=0

run() {
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

  {
    echo "-----------------------------------------------------------"
    echo "[$id] $method $path"
    echo "      role   : $role_name"
    [ -n "$body" ] && echo "      request: $body"
    echo "      status : $status (expected $expected) => $verdict"
    echo "      response:"
    python -c "import json,sys;print(json.dumps(json.load(open('/tmp/last_resp.json')), indent=2, ensure_ascii=False))" 2>/dev/null || cat /tmp/last_resp.json
    echo ""
  } >> "$OUT"
}

{
echo "==========================================================="
echo " INVENTORY — SUCCESSFUL BUSINESS RESPONSES"
echo " The 11 endpoints are now called with an AUTHORISED role"
echo " so you can see the actual data the API returns."
echo " Date: $(date)"
echo "==========================================================="
echo ""
} >> "$OUT"

# Each of the 11 endpoints, invoked with a role that's in its @PreAuthorize list
run "T03" "GET"   "/inventory/v1/stock-records?size=5"                        "INVENTORY_MANAGER"   "$TOKEN_INV"  "200" ""
run "T07" "POST"  "/inventory/v1/stock-records/sr-test-001/receive"           "WAREHOUSE_OPERATOR"  "$TOKEN_WH"   "200" '{"stockRecordId":"sr-test-001","purchaseOrderRef":"PO-003","supplierCode":"SUP1001","quantity":30,"unitCost":55.00}'
run "T09" "POST"  "/inventory/v1/stock-records/sr-test-001/adjust"            "INVENTORY_MANAGER"   "$TOKEN_INV"  "200" '{"quantityChange":7,"reason":"Cycle count correction"}'
run "T11" "PATCH" "/inventory/v1/stock-records/sr-test-001/threshold"         "INVENTORY_MANAGER"   "$TOKEN_INV"  "200" '{"reorderThreshold":25,"reorderQuantity":80}'
run "T15" "GET"   "/inventory/v1/movements/audit-journal?size=10"             "INVENTORY_MANAGER"   "$TOKEN_INV"  "200" ""
run "T17" "POST"  "/inventory/v1/movements/bulk"                              "WAREHOUSE_OPERATOR"  "$TOKEN_WH"   "200" '{"stockRecordIds":["sr-test-001"],"movementType":"ADJUSTMENT_IN","quantity":4,"reason":"Bulk authorised run"}'
run "T20" "GET"   "/inventory/v1/dashboard"                                   "INVENTORY_MANAGER"   "$TOKEN_INV"  "200" ""
run "T23" "GET"   "/inventory/v1/fifo-layers/summary/sr-test-001"             "FINANCE_MANAGER"     "$TOKEN_FIN"  "200" ""
run "T26" "GET"   "/inventory/v1/alerts/reorder-suggestions"                  "PROCUREMENT_MANAGER" "$TOKEN_PROC" "200" ""
run "T29" "POST"  "/inventory/v1/reservations/soft"                           "INVENTORY_MANAGER"   "$TOKEN_INV"  "201" '{"skuCode":"SKU12345","orderId":"ord-test-003","clientRef":"CLI-003","quantity":3,"omsStatus":"PENDING"}'
run "T33" "POST"  "/inventory/v1/returns"                                     "WAREHOUSE_OPERATOR"  "$TOKEN_WH"   "201" '{"skuCode":"SKU12345","orderId":"ord-test-001","customerRef":"CUST-042","returnReason":"WRONG_SIZE","productCondition":"NEW","quantity":1}'

{
echo "==========================================================="
echo " SUMMARY: PASS=$PASS  FAIL=$FAIL  TOTAL=$((PASS+FAIL))"
echo "==========================================================="
} >> "$OUT"
cat "$OUT"

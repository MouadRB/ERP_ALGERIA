#!/bin/bash
source /tmp/tokens.sh
OUT=./CATALOG_TEST_REPORT.txt
PASS_FILE=/tmp/catalog_pass.txt
FAIL_FILE=/tmp/catalog_fail.txt
> "$OUT"; > "$PASS_FILE"; > "$FAIL_FILE"
PASS=0; FAIL=0

run() {
  local id="$1" method="$2" path="$3" role_name="$4" token="$5" expected="$6" body="$7"
  if [ -n "$body" ]; then
    status=$(curl -s -o /tmp/last_resp.json -w "%{http_code}" -X "$method" \
      -H "Authorization: Bearer $token" -H "Content-Type: application/json" \
      -d "$body" "$BASE$path")
  elif [ -n "$token" ]; then
    status=$(curl -s -o /tmp/last_resp.json -w "%{http_code}" -X "$method" \
      -H "Authorization: Bearer $token" "$BASE$path")
  else
    status=$(curl -s -o /tmp/last_resp.json -w "%{http_code}" -X "$method" "$BASE$path")
  fi
  local verdict="PASS"
  [ "$status" != "$expected" ] && verdict="FAIL"
  local resp
  resp=$(head -c 220 /tmp/last_resp.json)

  local line
  line=$(printf "[%s] %-5s %-52s role=%-20s exp=%s got=%s\n      body: %s\n" \
      "$id" "$method" "$path" "$role_name" "$expected" "$status" "$resp")

  if [ "$verdict" = "PASS" ]; then
    PASS=$((PASS+1))
    printf "%s\n\n" "$line" >> "$PASS_FILE"
  else
    FAIL=$((FAIL+1))
    printf "%s\n\n" "$line" >> "$FAIL_FILE"
  fi
}

# ── Analytics ───────────────────────────────────────────────
run "CAT01" "GET"   "/catalog/v1/analytics"                              "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" ""
run "CAT02" "GET"   "/catalog/v1/analytics"                              "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "403" ""

# ── Categories ──────────────────────────────────────────────
run "CAT03" "GET"   "/catalog/v1/categories"                             "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" ""
run "CAT04" "GET"   "/catalog/v1/categories/ELEC-SMARTPHONES"            "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT05" "POST"  "/catalog/v1/categories"                             "PRODUCT_MANAGER"     "$TOKEN_SUPER" "201" '{"code":"TEST-CAT-001","nameFr":"Test Category","nameAr":"فئة اختبار","metaTitleFr":"Test","tvaCategoryCode":"TVA_19","position":99}'
run "CAT06" "POST"  "/catalog/v1/categories"                             "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "403" '{"code":"TEST-CAT-999","nameFr":"x","position":0}'
run "CAT07" "PUT"   "/catalog/v1/categories/TEST-CAT-001"                "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" '{"nameFr":"Test Category Updated","nameAr":"تحديث","metaTitleFr":"Updated","tvaCategoryCode":"TVA_19","position":99}'
run "CAT08" "DELETE" "/catalog/v1/categories/TEST-CAT-001"               "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT09" "GET"   "/catalog/v1/categories"                             "LOGISTICS_AGENT"     "$TOKEN_LOG"   "403" ""

# ── Sales Channels ──────────────────────────────────────────
run "CAT10" "GET"   "/catalog/v1/channels"                               "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" ""
run "CAT11" "GET"   "/catalog/v1/channels/WEB"                           "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" ""
run "CAT12" "PUT"   "/catalog/v1/channels/WEB/rules"                     "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" '{"channelType":"WEB","autoMaskOnZeroStock":true,"autoRepublishOnStock":true,"excludeZeroPrice":true,"excludeNegativeStock":true,"excludeOcrDraft":false,"excludeVariantsIndividual":false,"minPriceDzd":500,"maxPriceDzd":1000000}'
run "CAT13" "PATCH" "/catalog/v1/channels/WEB/activate"                  "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT14" "PATCH" "/catalog/v1/channels/WEB/deactivate"                "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT15" "PATCH" "/catalog/v1/channels/WEB/activate"                  "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "403" ""

# ── WhatsApp ────────────────────────────────────────────────
run "CAT16" "GET"   "/catalog/v1/channels/whatsapp/sync/status"          "SUPER_ADMIN"         "$TOKEN_SUPER" "200" ""
run "CAT17" "POST"  "/catalog/v1/channels/whatsapp/sync"                 "SUPER_ADMIN"         "$TOKEN_SUPER" "200" ""
run "CAT18" "POST"  "/catalog/v1/channels/whatsapp/sync"                 "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "403" ""

# ── Catalog Products ────────────────────────────────────────
run "CAT19" "POST"  "/catalog/v1/products/SKU12345/publish"              "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" '{"skuCode":"SKU12345","channels":["WEB","WHATSAPP"]}'
run "CAT20" "GET"   "/catalog/v1/products/SKU12345"                      "INVENTORY_MANAGER"   "$TOKEN_INV"   "200" ""
run "CAT21" "GET"   "/catalog/v1/products/SKU12345/diagnostic"           "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT22" "POST"  "/catalog/v1/products/SKU12345/channels/WEB/toggle?enabled=false" "PRODUCT_MANAGER" "$TOKEN_SUPER" "200" ""
run "CAT23" "POST"  "/catalog/v1/products/SKU12345/rules/MASK_IF_STOCK_ZERO/toggle?enabled=true" "PRODUCT_MANAGER" "$TOKEN_SUPER" "200" ""
run "CAT24" "POST"  "/catalog/v1/products/SKU12345/schedule"             "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" '{"skuCode":"SKU12345","scheduledAt":"2027-01-01T10:00:00"}'
run "CAT25" "DELETE" "/catalog/v1/products/SKU12345/schedule"            "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
# Re-publish silently so CAT26 has a PUBLISHED product to unpublish
curl -s -o /dev/null -X POST -H "Authorization: Bearer $TOKEN_SUPER" -H "Content-Type: application/json" \
     -d '{"skuCode":"SKU12345","channels":["WEB"]}' "$BASE/catalog/v1/products/SKU12345/publish"
run "CAT26" "POST"  "/catalog/v1/products/SKU12345/unpublish"            "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT27" "POST"  "/catalog/v1/products/bulk"                          "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" '{"skuCodes":["SKU12345"],"action":"PUBLISH","channels":["WEB"]}'
run "CAT28" "POST"  "/catalog/v1/products/SKU12345/publish"              "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "403" '{"skuCode":"SKU12345","channels":["WEB"]}'

# ── Search ──────────────────────────────────────────────────
run "CAT29" "GET"   "/catalog/v1/search?q=smartphone&page=0&size=10"     "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT30" "GET"   "/catalog/v1/search/suggest?q=smart"                 "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT31" "GET"   "/catalog/v1/search/index-status"                    "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT32" "POST"  "/catalog/v1/search/reindex"                         "PRODUCT_MANAGER"     "$TOKEN_SUPER" "200" ""
run "CAT33" "POST"  "/catalog/v1/search/reindex"                         "WAREHOUSE_OPERATOR"  "$TOKEN_WH"    "403" ""

# ── Auth negative ───────────────────────────────────────────
run "CAT34" "GET"   "/catalog/v1/categories"                             "NO_TOKEN"            ""             "403" ""

TOTAL=$((PASS+FAIL))
{
echo "==========================================================="
echo " CATALOG API TEST REPORT"
echo " Target:   $BASE"
echo " Date:     $(date)"
echo " RBAC:     Authoritative Matrix v2.0"
echo " Seed:     category=ELEC-SMARTPHONES, sku=SKU12345"
echo "==========================================================="
echo ""
echo " SUMMARY:  PASS=$PASS   FAIL=$FAIL   TOTAL=$TOTAL"
echo "==========================================================="
echo ""
echo "========= SUCCESSFUL (PASS) ================================"
cat "$PASS_FILE"
echo "========= FAILED (FAIL) ===================================="
if [ "$FAIL" -eq 0 ]; then echo "(none)"; echo ""; else cat "$FAIL_FILE"; fi
} > "$OUT"
cat "$OUT"

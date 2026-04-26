## Engine-B API Test Script (PowerShell)
## Tests all modules: Auth, Dashboard, CRM, Procurement, Finance, Outbox

$base = "http://localhost:5220"
$results = @()
$pass = 0
$fail = 0

function Test-Api {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Label,
        [int[]]$ExpectedCodes = @(200),
        [string]$Body = $null,
        [hashtable]$Headers = @{}
    )
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        if ($Body) { $params.Body = $Body }
        $resp = Invoke-WebRequest @params
        $code = $resp.StatusCode
        $ok = $code -in $ExpectedCodes
        $status = if ($ok) { "PASS" } else { "FAIL" }
        $script:results += [PSCustomObject]@{ Test=$Label; Status=$status; Code=$code; Detail="" }
        if ($ok) { $script:pass++ } else { $script:fail++ }
        Write-Host "$status  [$code] $Label"
        return $resp
    } catch {
        $code = 0
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
        }
        $ok = $code -in $ExpectedCodes
        $status = if ($ok) { "PASS" } else { "FAIL" }
        $detail = $_.Exception.Message.Substring(0, [Math]::Min(80, $_.Exception.Message.Length))
        $script:results += [PSCustomObject]@{ Test=$Label; Status=$status; Code=$code; Detail=$detail }
        if ($ok) { $script:pass++ } else { $script:fail++ }
        Write-Host "$status  [$code] $Label"
        return $null
    }
}

Write-Host "`n=== ENGINE-B COMPREHENSIVE API TEST ===" -ForegroundColor Cyan
Write-Host "Base URL: $base`n"

# ══════════════════════════════════════════════════════════════════════════════
# 1. AUTH MODULE — Register + Login to get JWT
# ══════════════════════════════════════════════════════════════════════════════
Write-Host "`n--- AUTH MODULE ---" -ForegroundColor Yellow

# Register a SuperAdmin test user
$regBody = '{"email":"testadmin@erp.dz","password":"TestPass123!","fullName":"Test SuperAdmin"}'
Test-Api -Method POST -Url "$base/api/auth/register" -Label "AUTH: Register test user" -ExpectedCodes @(200,400) -Body $regBody

# Assign SuperAdmin role
Test-Api -Method POST -Url "$base/api/auth/assign-role?email=testadmin@erp.dz&roleName=SuperAdmin" -Label "AUTH: Assign SuperAdmin role" -ExpectedCodes @(200)

# Login to get JWT
$loginBody = '{"email":"testadmin@erp.dz","password":"TestPass123!"}'
$loginResp = Test-Api -Method POST -Url "$base/api/auth/login" -Label "AUTH: Login (get JWT)" -ExpectedCodes @(200) -Body $loginBody

$token = ""
if ($loginResp) {
    $json = $loginResp.Content | ConvertFrom-Json
    $token = $json.token
    Write-Host "  -> JWT obtained: $($token.Substring(0,30))..." -ForegroundColor Green
}

$authHeaders = @{ "Authorization" = "Bearer $token" }

# ══════════════════════════════════════════════════════════════════════════════
# 2. DASHBOARD MODULE
# ══════════════════════════════════════════════════════════════════════════════
Write-Host "`n--- DASHBOARD MODULE ---" -ForegroundColor Yellow

Test-Api -Method GET -Url "$base/api/dashboard" -Label "DASHBOARD: Full summary" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/dashboard/kpis" -Label "DASHBOARD: KPIs" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/dashboard/confirmation-queue" -Label "DASHBOARD: Confirmation queue" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/dashboard/cod-funnel" -Label "DASHBOARD: COD funnel" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/dashboard/risk-score" -Label "DASHBOARD: Risk score" -Headers $authHeaders

# Confirm a single order (use first seeded order)
Test-Api -Method POST -Url "$base/api/dashboard/orders/a1b2c3d4-0001-0001-0001-000000000001/confirm" -Label "DASHBOARD: Confirm single order" -Headers $authHeaders -ExpectedCodes @(200,404)

# Confirm all pending
Test-Api -Method POST -Url "$base/api/dashboard/orders/confirm-all" -Label "DASHBOARD: Confirm all pending" -Headers $authHeaders

# ══════════════════════════════════════════════════════════════════════════════
# 3. CRM MODULE — Customers
# ══════════════════════════════════════════════════════════════════════════════
Write-Host "`n--- CRM MODULE: CUSTOMERS ---" -ForegroundColor Yellow

Test-Api -Method GET -Url "$base/api/crm/customers" -Label "CRM: List customers" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/crm/stats" -Label "CRM: Customer stats" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/crm/analytics" -Label "CRM: Analytics" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/crm/filters/metadata" -Label "CRM: Filter metadata" -Headers $authHeaders

# Create a customer
$custBody = '{"fullName":"Test Client API","phone":"+213 0550 999 888","email":"test@api.dz","wilaya":16,"city":"Alger"}'
$custResp = Test-Api -Method POST -Url "$base/api/crm/customers" -Label "CRM: Create customer" -Headers $authHeaders -Body $custBody -ExpectedCodes @(201)

$custId = ""
if ($custResp) {
    $json = $custResp.Content | ConvertFrom-Json
    $custId = $json.id
    Write-Host "  -> Customer ID: $custId" -ForegroundColor Green
}

# Get single customer
if ($custId) {
    Test-Api -Method GET -Url "$base/api/crm/customers/$custId" -Label "CRM: Get customer by ID" -Headers $authHeaders
    Test-Api -Method GET -Url "$base/api/crm/customers/$custId/detail" -Label "CRM: Customer detail (tabs)" -Headers $authHeaders
    Test-Api -Method GET -Url "$base/api/crm/customers/$custId/orders" -Label "CRM: Customer orders" -Headers $authHeaders
    Test-Api -Method GET -Url "$base/api/crm/customers/$custId/risk-profile" -Label "CRM: Risk profile" -Headers $authHeaders

    # Update
    $updateBody = '{"fullName":"Test Client Updated","city":"Oran"}'
    Test-Api -Method PUT -Url "$base/api/crm/customers/$custId" -Label "CRM: Update customer" -Headers $authHeaders -Body $updateBody

    # Blacklist
    $blBody = '{"reason":"Test blacklist","notes":"API test"}'
    Test-Api -Method POST -Url "$base/api/crm/customers/$custId/blacklist" -Label "CRM: Blacklist customer" -Headers $authHeaders -Body $blBody
    Test-Api -Method GET -Url "$base/api/crm/customers/blacklist" -Label "CRM: Get blacklist" -Headers $authHeaders
    Test-Api -Method DELETE -Url "$base/api/crm/customers/$custId/blacklist" -Label "CRM: Unblacklist" -Headers $authHeaders

    # Lookup by phone
    Test-Api -Method GET -Url "$base/api/crm/customers/lookup?phone=%2B213+0550+999+888" -Label "CRM: Phone lookup" -Headers $authHeaders -ExpectedCodes @(200,404)

    # Interactions
    $intBody = '{"content":"API test interaction","type":"Note"}'
    Test-Api -Method POST -Url "$base/api/crm/customers/$custId/interactions" -Label "CRM: Add interaction" -Headers $authHeaders -Body $intBody -ExpectedCodes @(201)
    Test-Api -Method GET -Url "$base/api/crm/customers/$custId/interactions" -Label "CRM: List interactions" -Headers $authHeaders
}

# ══════════════════════════════════════════════════════════════════════════════
# 4. CRM MODULE — Tickets
# ══════════════════════════════════════════════════════════════════════════════
Write-Host "`n--- CRM MODULE: TICKETS ---" -ForegroundColor Yellow

Test-Api -Method GET -Url "$base/api/crm/tickets" -Label "CRM: List tickets" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/crm/tickets/stats" -Label "CRM: Ticket stats" -Headers $authHeaders

# Create ticket
$ticketCustId = if ($custId) { $custId } else { "c1000000-0000-0000-0000-000000000001" }
$tktBody = "{`"customerId`":`"$ticketCustId`",`"subject`":`"Test Ticket API`",`"description`":`"Created by test script`",`"type`":`"ProductReturn`",`"priority`":`"High`"}"
$tktResp = Test-Api -Method POST -Url "$base/api/crm/tickets" -Label "CRM: Create ticket" -Headers $authHeaders -Body $tktBody -ExpectedCodes @(201)

$tktId = ""
if ($tktResp) {
    $json = $tktResp.Content | ConvertFrom-Json
    $tktId = $json.id
    Write-Host "  -> Ticket ID: $tktId" -ForegroundColor Green
}

if ($tktId) {
    Test-Api -Method GET -Url "$base/api/crm/tickets/$tktId" -Label "CRM: Get ticket by ID" -Headers $authHeaders

    # Update ticket
    $tktUpdate = '{"status":"InProgress","priority":"Normal"}'
    Test-Api -Method PUT -Url "$base/api/crm/tickets/$tktId" -Label "CRM: Update ticket" -Headers $authHeaders -Body $tktUpdate

    # Assign
    $assignBody = '{"agentName":"Agent Test"}'
    Test-Api -Method POST -Url "$base/api/crm/tickets/$tktId/assign" -Label "CRM: Assign ticket" -Headers $authHeaders -Body $assignBody

    # Escalate
    Test-Api -Method POST -Url "$base/api/crm/tickets/$tktId/escalate" -Label "CRM: Escalate ticket" -Headers $authHeaders

    # Close
    Test-Api -Method POST -Url "$base/api/crm/tickets/$tktId/close" -Label "CRM: Close ticket" -Headers $authHeaders
}

# ══════════════════════════════════════════════════════════════════════════════
# 5. PROCUREMENT MODULE
# ══════════════════════════════════════════════════════════════════════════════
Write-Host "`n--- PROCUREMENT MODULE ---" -ForegroundColor Yellow

Test-Api -Method GET -Url "$base/api/procurement/overview" -Label "PROC: Overview" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/procurement/suppliers" -Label "PROC: Suppliers" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/procurement/stock-alerts" -Label "PROC: Stock alerts" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/procurement/receipts" -Label "PROC: Receipts" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/procurement/analytics" -Label "PROC: Analytics" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/procurement/purchase-orders" -Label "PROC: List POs" -Headers $authHeaders

# ══════════════════════════════════════════════════════════════════════════════
# 6. FINANCE MODULE
# ══════════════════════════════════════════════════════════════════════════════
Write-Host "`n--- FINANCE MODULE ---" -ForegroundColor Yellow

Test-Api -Method GET -Url "$base/api/finance/overview" -Label "FIN: Overview (dashboard KPIs)" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/finance/invoices" -Label "FIN: List invoices" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/finance/revenue/overview" -Label "FIN: Revenue overview" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/finance/revenue/by-wilaya" -Label "FIN: Revenue by wilaya" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/finance/revenue/timeline" -Label "FIN: Revenue timeline" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/finance/revenue/top-products" -Label "FIN: Top products" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/finance/deferred-revenue" -Label "FIN: Deferred revenue" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/finance/fifo-valuation" -Label "FIN: FIFO valuation" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/finance/fifo-layers" -Label "FIN: FIFO layers" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/finance/periods" -Label "FIN: Accounting periods" -Headers $authHeaders

# Create invoice
$invBody = '{"orderNumber":"#TEST-001","customerName":"Test Client","customerPhone":"+213 0550 111 222","wilaya":16,"subtotal":10000,"taxRate":19}'
$invResp = Test-Api -Method POST -Url "$base/api/finance/invoices" -Label "FIN: Create invoice" -Headers $authHeaders -Body $invBody -ExpectedCodes @(201)

$invId = ""
if ($invResp) {
    $json = $invResp.Content | ConvertFrom-Json
    $invId = $json.id
    Write-Host "  -> Invoice ID: $invId" -ForegroundColor Green
}

if ($invId) {
    Test-Api -Method GET -Url "$base/api/finance/invoices/$invId" -Label "FIN: Get invoice by ID" -Headers $authHeaders
    Test-Api -Method POST -Url "$base/api/finance/invoices/$invId/issue" -Label "FIN: Issue invoice" -Headers $authHeaders
    Test-Api -Method POST -Url "$base/api/finance/invoices/$invId/pay" -Label "FIN: Mark invoice paid" -Headers $authHeaders
}

# Create and void another invoice
$inv2Body = '{"orderNumber":"#TEST-002","customerName":"Void Test","customerPhone":"+213 0550 333 444","wilaya":31,"subtotal":5000,"taxRate":19}'
$inv2Resp = Test-Api -Method POST -Url "$base/api/finance/invoices" -Label "FIN: Create invoice (for void)" -Headers $authHeaders -Body $inv2Body -ExpectedCodes @(201)
if ($inv2Resp) {
    $inv2Id = ($inv2Resp.Content | ConvertFrom-Json).id
    $voidBody = '{"reason":"Test void from API"}'
    Test-Api -Method POST -Url "$base/api/finance/invoices/$inv2Id/void" -Label "FIN: Void invoice" -Headers $authHeaders -Body $voidBody
}

# Accounting periods
$periodBody = '{"name":"Avril 2026","startDate":"2026-04-01","endDate":"2026-04-30"}'
$periodResp = Test-Api -Method POST -Url "$base/api/finance/periods" -Label "FIN: Create period" -Headers $authHeaders -Body $periodBody

$periodId = ""
if ($periodResp) {
    $json = $periodResp.Content | ConvertFrom-Json
    $periodId = $json.id
    Write-Host "  -> Period ID: $periodId" -ForegroundColor Green
}

if ($periodId) {
    Test-Api -Method GET -Url "$base/api/finance/periods/current" -Label "FIN: Get current period" -Headers $authHeaders
    Test-Api -Method POST -Url "$base/api/finance/periods/$periodId/lock" -Label "FIN: Lock period" -Headers $authHeaders
    Test-Api -Method POST -Url "$base/api/finance/periods/$periodId/reopen" -Label "FIN: Reopen period" -Headers $authHeaders
    Test-Api -Method POST -Url "$base/api/finance/periods/$periodId/lock" -Label "FIN: Lock period (again)" -Headers $authHeaders
    Test-Api -Method POST -Url "$base/api/finance/periods/$periodId/close" -Label "FIN: Close period" -Headers $authHeaders
}

# FIFO layer
$fifoBody = '{"sku":"SKU-NIKE-AM90","productName":"Nike Air Max 90","warehouse":"Alger WH-01","quantity":100,"unitCost":8500}'
Test-Api -Method POST -Url "$base/internal/finance/fifo/from-receipt" -Label "FIN(Internal): Create FIFO layer" -Headers $authHeaders -ExpectedCodes @(200,403)

# ══════════════════════════════════════════════════════════════════════════════
# 7. OUTBOX MODULE
# ══════════════════════════════════════════════════════════════════════════════
Write-Host "`n--- OUTBOX MODULE ---" -ForegroundColor Yellow

Test-Api -Method GET -Url "$base/api/outbox?limit=10" -Label "OUTBOX: Poll messages" -Headers $authHeaders
Test-Api -Method GET -Url "$base/api/outbox/status" -Label "OUTBOX: Status" -Headers $authHeaders

# ══════════════════════════════════════════════════════════════════════════════
# 8. INTERNAL CRM
# ══════════════════════════════════════════════════════════════════════════════
Write-Host "`n--- INTERNAL CRM ---" -ForegroundColor Yellow

Test-Api -Method POST -Url "$base/internal/crm/rfm/recalculate" -Label "CRM(Internal): RFM recalculate" -Headers $authHeaders -ExpectedCodes @(200,403)
Test-Api -Method POST -Url "$base/internal/crm/fraud/score" -Label "CRM(Internal): Fraud scoring" -Headers $authHeaders -ExpectedCodes @(200,403)

# ══════════════════════════════════════════════════════════════════════════════
# 9. CLEANUP — Delete test customer
# ══════════════════════════════════════════════════════════════════════════════
if ($custId) {
    Test-Api -Method DELETE -Url "$base/api/crm/customers/$custId" -Label "CRM: Delete test customer" -Headers $authHeaders -ExpectedCodes @(204)
}
if ($tktId) {
    Test-Api -Method DELETE -Url "$base/api/crm/tickets/$tktId" -Label "CRM: Delete test ticket" -Headers $authHeaders -ExpectedCodes @(204,404)
}

# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  RESULTS: $pass PASS / $fail FAIL / $($pass + $fail) TOTAL" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "======================================`n" -ForegroundColor Cyan

if ($fail -gt 0) {
    Write-Host "Failed tests:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  FAIL [$($_.Code)] $($_.Test) - $($_.Detail)" -ForegroundColor Red
    }
}

# Output full table
$results | Format-Table -Property Status, Code, Test, Detail -AutoSize

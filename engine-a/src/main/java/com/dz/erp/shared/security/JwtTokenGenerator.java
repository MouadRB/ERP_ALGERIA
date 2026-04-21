package com.dz.erp.shared.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

/**
 * Generates JWT tokens for testing.
 *
 * Run with: mvn exec:java -Dexec.mainClass=" com.dz.erp.shared.security.JwtTokenGenerator"
 * Or just run the main method from your IDE.
 *
 * The tokens match exactly what JwtAuthenticationFilter expects:
 *   - sub       → userId
 *   - tenant_id → tenantId
 *   - username  → display name
 *   - roles     → list of role strings
 */
public class JwtTokenGenerator {

    // Must match app.security.jwt.secret in application.yml
    private static final String SECRET = "changeme-in-production-use-256-bit-minimum-key-here-please";

    public static void main(String[] args) {
        System.out.println("════════════════════════════════════════════════════");
        System.out.println("  JWT Token Generator — Engine A Testing");
        System.out.println("════════════════════════════════════════════════════\n");

        // ── User 1: Product Manager (creates SKUs, suppliers, products) ──
        var productManager = generate(
                "user-42",
                "default",
                "Mohammed",
                List.of("PRODUCT_MANAGER")
        );
        System.out.println("PRODUCT_MANAGER (user-42 / Mohammed):");
        System.out.println(productManager);
        System.out.println();

        // ── User 2: Inventory Manager (activates SKUs) ──
        var inventoryManager = generate(
                "user-78",
                "default",
                "Fatima",
                List.of("INVENTORY_MANAGER")
        );
        System.out.println("INVENTORY_MANAGER (user-78 / Fatima):");
        System.out.println(inventoryManager);
        System.out.println();

        // ── User 3: Procurement Manager (creates/activates suppliers) ──
        var procurementManager = generate(
                "user-55",
                "default",
                "Karim",
                List.of("PROCUREMENT_MANAGER")
        );
        System.out.println("PROCUREMENT_MANAGER (user-55 / Karim):");
        System.out.println(procurementManager);
        System.out.println();

        // ── User 4: Finance Manager (creates/activates tax rules) ──
        var financeManager = generate(
                "user-33",
                "default",
                "Amina",
                List.of("FINANCE_MANAGER")
        );
        System.out.println("FINANCE_MANAGER (user-33 / Amina):");
        System.out.println(financeManager);
        System.out.println();

        // ── User 5: Logistics Manager (creates/activates wilayas) ──
        var logisticsManager = generate(
                "user-21",
                "default",
                "Yacine",
                List.of("LOGISTICS_MANAGER")
        );
        System.out.println("LOGISTICS_MANAGER (user-21 / Yacine):");
        System.out.println(logisticsManager);
        System.out.println();

        // ── User 6: Warehouse Manager (creates/activates bins) ──
        var warehouseManager = generate(
                "user-90",
                "default",
                "Nadia",
                List.of("WAREHOUSE_MANAGER")
        );
        System.out.println("WAREHOUSE_MANAGER (user-90 / Nadia):");
        System.out.println(warehouseManager);
        System.out.println();

        // ── User 7: Super Admin (can do everything) ──
        var superAdmin = generate(
                "user-01",
                "default",
                "Admin",
                List.of("SUPER_ADMIN")
        );
        System.out.println("SUPER_ADMIN (user-01 / Admin):");
        System.out.println(superAdmin);
        System.out.println();

        // ── User 8: Multi-role user (for testing SoD — create with one role, activate with another) ──
        var multiRole = generate(
                "user-99",
                "default",
                "Rachid",
                List.of("PRODUCT_MANAGER", "INVENTORY_MANAGER", "PROCUREMENT_MANAGER")
        );
        System.out.println("MULTI_ROLE (user-99 / Rachid):");
        System.out.println(multiRole);
        System.out.println();

        // ── Usage examples ──
        System.out.println("════════════════════════════════════════════════════");
        System.out.println("  Usage with curl:");
        System.out.println("════════════════════════════════════════════════════\n");

        System.out.println("# 1. Register a SKU (as Product Manager):");
        System.out.println("curl -X POST http://localhost:8081/api/mdm/v1/skus \\");
        System.out.println("  -H \"Authorization: Bearer " + productManager + "\" \\");
        System.out.println("  -H \"Content-Type: application/json\" \\");
        System.out.println("  -d '{\"skuCode\":\"CASE-S24-BLK\",\"baseUom\":\"PIECE\",\"productType\":\"SIMPLE\"}'");
        System.out.println();

        System.out.println("# 2. Activate the SKU (as Inventory Manager — different user for SoD):");
        System.out.println("curl -X PATCH http://localhost:8081/api/mdm/v1/skus/CASE-S24-BLK/activate \\");
        System.out.println("  -H \"Authorization: Bearer " + inventoryManager + "\"");
        System.out.println();

        System.out.println("# 3. Register a Supplier (as Procurement Manager):");
        System.out.println("curl -X POST http://localhost:8081/api/mdm/v1/suppliers \\");
        System.out.println("  -H \"Authorization: Bearer " + procurementManager + "\" \\");
        System.out.println("  -H \"Content-Type: application/json\" \\");
        System.out.println("  -d '{\"supplierCode\":\"SUP-ALG-001\",\"companyName\":\"Techno Import SARL\",\"phone\":\"+213555123456\",\"wilayaCode\":\"16\"}'");
        System.out.println();

        System.out.println("# 4. Create a Tax Rule (as Finance Manager):");
        System.out.println("curl -X POST http://localhost:8081/api/mdm/v1/tax-rules \\");
        System.out.println("  -H \"Authorization: Bearer " + financeManager + "\" \\");
        System.out.println("  -H \"Content-Type: application/json\" \\");
        System.out.println("  -d '{\"taxRuleCode\":\"TAX-ELEC-19\",\"categoryCode\":\"ELECTRONICS\",\"taxRate\":19.00,\"description\":\"TVA 19%\",\"effectiveFrom\":\"2026-01-01\"}'");
        System.out.println();

        System.out.println("# 5. Create a Wilaya (as Logistics Manager):");
        System.out.println("curl -X POST http://localhost:8081/api/mdm/v1/wilayas \\");
        System.out.println("  -H \"Authorization: Bearer " + logisticsManager + "\" \\");
        System.out.println("  -H \"Content-Type: application/json\" \\");
        System.out.println("  -d '{\"wilayaCode\":\"16\",\"name\":\"Alger\",\"nameAr\":\"الجزائر\",\"zone\":\"CENTRE\",\"deliveryCostDzd\":400,\"estimatedDays\":\"1-2\",\"deliverable\":true}'");
        System.out.println();

        System.out.println("# 6. Create a Bin (as Warehouse Manager):");
        System.out.println("curl -X POST http://localhost:8081/api/mdm/v1/bins \\");
        System.out.println("  -H \"Authorization: Bearer " + warehouseManager + "\" \\");
        System.out.println("  -H \"Content-Type: application/json\" \\");
        System.out.println("  -d '{\"binCode\":\"A-01-01\",\"zone\":\"A\",\"rack\":\"01\",\"shelf\":\"01\",\"maxCapacity\":50,\"binType\":\"STANDARD\"}'");
        System.out.println();

        System.out.println("# 7. SoD test — try activating your own SKU (should fail with 403):");
        System.out.println("curl -X PATCH http://localhost:8081/api/mdm/v1/skus/CASE-S24-BLK/activate \\");
        System.out.println("  -H \"Authorization: Bearer " + productManager + "\"");
        System.out.println("  # → 403: Segregation of Duties violation");
    }

    public static String generate(String userId, String tenantId, String username, List<String> roles) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(userId)
                .claim("tenant_id", tenantId)
                .claim("username", username)
                .claim("roles", roles)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(24, ChronoUnit.HOURS)))
                .signWith(key)
                .compact();
    }
}

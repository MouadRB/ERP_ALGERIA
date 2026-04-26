package com.dz.erp.shared.security;

/**
 * Central ERP role constants aligned with the Authoritative RBAC Matrix v2.0.
 *
 * <p>Role semantics (from the matrix):
 * <ul>
 *   <li>{@link #SUPER_ADMIN}         — full CRUD on every module</li>
 *   <li>{@link #PRODUCT_MANAGER}     — CRUD on PIM/Catalog</li>
 *   <li>{@link #INVENTORY_MANAGER}   — CRUD on Inventory and WMS</li>
 *   <li>{@link #FINANCE_MANAGER}     — CRUD on Finance</li>
 *   <li>{@link #PROCUREMENT_MANAGER} — CRUD on Procurement; Read on MDM, Inventory, Orders, Finance</li>
 *   <li>{@link #SALES_MANAGER}       — CRUD on Orders (OMS)</li>
 *   <li>{@link #CS_AGENT}            — CRUD on Orders returns / customer-service flows</li>
 *   <li>{@link #WAREHOUSE_OPERATOR}  — CRUD on WMS; Update on Inventory; Read on Orders</li>
 *   <li>{@link #CRM_AGENT}           — CRUD on CRM; Read on Orders</li>
 *   <li>{@link #LOGISTICS_AGENT}     — Read on Inventory, WMS, CRM; Update on Orders</li>
 *   <li>{@link #REPORTING_ANALYST}   — Read on every module</li>
 *   <li>{@link #OMS_SERVICE}         — internal service account used by the OMS for cross-module calls</li>
 * </ul>
 *
 * <p>Use with {@code @PreAuthorize("hasAnyRole(...)")}. Values are bare role names;
 * Spring Security prepends the {@code ROLE_} prefix automatically.
 */
public final class Roles {

    public static final String SUPER_ADMIN         = "SUPER_ADMIN";

    public static final String PRODUCT_MANAGER     = "PRODUCT_MANAGER";
    public static final String INVENTORY_MANAGER   = "INVENTORY_MANAGER";
    public static final String FINANCE_MANAGER     = "FINANCE_MANAGER";
    public static final String PROCUREMENT_MANAGER = "PROCUREMENT_MANAGER";
    public static final String SALES_MANAGER       = "SALES_MANAGER";

    public static final String WAREHOUSE_OPERATOR  = "WAREHOUSE_OPERATOR";
    public static final String CRM_AGENT           = "CRM_AGENT";
    public static final String LOGISTICS_AGENT     = "LOGISTICS_AGENT";
    public static final String CS_AGENT            = "CS_AGENT";
    public static final String REPORTING_ANALYST   = "REPORTING_ANALYST";

    public static final String OMS_SERVICE         = "OMS_SERVICE";

    private Roles() {}
}

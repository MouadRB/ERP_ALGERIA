package com.dz.erp.oms.common;

/**
 * OMS role constants. Used in {@code @PreAuthorize} expressions via {@code hasAnyRole(...)}.
 *
 * <p>Existing ERP roles (documented in {@code docs/SHARED_MODULE.md}):
 * {@code SUPER_ADMIN}, {@code PRODUCT_MANAGER}, {@code INVENTORY_MANAGER},
 * {@code FINANCE_MANAGER}, {@code PROCUREMENT_MANAGER}.
 *
 * <p>Added by OMS:
 * <ul>
 *   <li>{@link #SALES_MANAGER}   — read orders, cancel unshipped, receives out-of-stock alerts</li>
 *   <li>{@link #CS_AGENT}        — read orders, open returns, resolve delivery failures</li>
 *   <li>{@link #WAREHOUSE_STAFF} — confirm packing is done (POST /orders/{id}/packed)</li>
 * </ul>
 */
public final class OmsRoles {

    public static final String SUPER_ADMIN      = "SUPER_ADMIN";
    public static final String FINANCE_MANAGER  = "FINANCE_MANAGER";

    public static final String SALES_MANAGER    = "SALES_MANAGER";
    public static final String CS_AGENT         = "CS_AGENT";
    public static final String WAREHOUSE_STAFF  = "WAREHOUSE_STAFF";

    private OmsRoles() {}
}

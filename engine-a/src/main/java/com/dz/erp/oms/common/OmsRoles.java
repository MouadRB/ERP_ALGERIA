package com.dz.erp.oms.common;

import com.dz.erp.shared.security.Roles;

/**
 * OMS role constants. Used in {@code @PreAuthorize} expressions via {@code hasAnyRole(...)}.
 *
 * <p>Thin alias over {@link Roles} for OMS-relevant roles. Authoritative names and semantics
 * live in the central {@link Roles} class and the RBAC Matrix v2.0.
 */
public final class OmsRoles {

    public static final String SUPER_ADMIN         = Roles.SUPER_ADMIN;
    public static final String FINANCE_MANAGER     = Roles.FINANCE_MANAGER;
    public static final String PROCUREMENT_MANAGER = Roles.PROCUREMENT_MANAGER;

    public static final String SALES_MANAGER       = Roles.SALES_MANAGER;
    public static final String CS_AGENT            = Roles.CS_AGENT;
    public static final String WAREHOUSE_OPERATOR  = Roles.WAREHOUSE_OPERATOR;
    public static final String CRM_AGENT           = Roles.CRM_AGENT;
    public static final String LOGISTICS_AGENT     = Roles.LOGISTICS_AGENT;
    public static final String REPORTING_ANALYST   = Roles.REPORTING_ANALYST;

    private OmsRoles() {}
}

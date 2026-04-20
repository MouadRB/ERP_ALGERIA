package com.dz.erp.oms.common;

/**
 * OMS REST base paths. Single source of truth for submodule controllers.
 */
public final class OmsApiPaths {

    public static final String ORDERS            = "/oms/v1/orders";
    public static final String ORDERS_SEARCH     = "/oms/v1/orders/search";
    public static final String RETURNS           = "/oms/v1/returns";
    public static final String SHIPMENTS         = "/oms/v1/shipments";
    public static final String CARRIER_WEBHOOKS  = "/oms/v1/carriers/webhook";

    private OmsApiPaths() {}
}

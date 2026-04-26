package com.dz.erp.oms.common;

/**
 * UI notification types raised by OMS listeners via {@code shared/notification}.
 * <p>See {@code docs/OMS_MODULE.md} §6.5.
 */
public final class OmsNotificationTypes {

    public static final String ORDER_OUT_OF_STOCK    = "ORDER_OUT_OF_STOCK";     // SALES_MANAGER
    public static final String SHIPMENT_FAILED       = "SHIPMENT_FAILED";        // CS_AGENT, SALES_MANAGER
    public static final String RETURN_PENDING_PICKUP = "RETURN_PENDING_PICKUP";  // CS_AGENT
    public static final String OMS_DLQ               = "OMS_DLQ";                // SUPER_ADMIN

    private OmsNotificationTypes() {}
}

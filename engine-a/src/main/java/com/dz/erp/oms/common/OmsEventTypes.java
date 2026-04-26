package com.dz.erp.oms.common;

/**
 * OMS domain event type constants used as the {@code eventType} column in the
 * shared outbox table (same mechanism as PIM). Downstream relay to external
 * systems is handled entirely by {@code com.dz.erp.shared.outbox.OutboxPoller}.
 *
 * <p>See {@code docs/OMS_MODULE.md} §6.2.
 */
public final class OmsEventTypes {

    // Order lifecycle
    public static final String ORDER_RECEIVED         = "OMS_ORDER_RECEIVED";
    public static final String ORDER_VALIDATED        = "OMS_ORDER_VALIDATED";
    public static final String ORDER_REJECTED         = "OMS_ORDER_REJECTED";
    public static final String ORDER_AWAITING_STOCK   = "OMS_ORDER_AWAITING_STOCK";
    public static final String ORDER_RESERVED         = "OMS_ORDER_RESERVED";
    public static final String ORDER_CONFIRMED        = "OMS_ORDER_CONFIRMED";
    public static final String ORDER_CANCELLED        = "OMS_ORDER_CANCELLED";
    public static final String ORDER_COMPLETED        = "OMS_ORDER_COMPLETED";

    // Fulfillment
    public static final String ORDER_PACKED           = "OMS_ORDER_PACKED";

    // Integration / Shipment
    public static final String SHIPMENT_SUBMITTED     = "OMS_SHIPMENT_SUBMITTED";
    public static final String SHIPMENT_PICKED_UP     = "OMS_SHIPMENT_PICKED_UP";
    public static final String SHIPMENT_DELIVERED     = "OMS_SHIPMENT_DELIVERED";
    public static final String SHIPMENT_FAILED        = "OMS_SHIPMENT_FAILED";

    // Returns
    public static final String RETURN_REQUESTED       = "OMS_RETURN_REQUESTED";
    public static final String RETURN_CLOSED          = "OMS_RETURN_CLOSED";

    // Aggregate types (for outbox routing — same pattern as PIM)
    public static final String AGGREGATE_ORDER        = "OMS_ORDER";
    public static final String AGGREGATE_SHIPMENT     = "OMS_SHIPMENT";
    public static final String AGGREGATE_RETURN       = "OMS_RETURN";

    private OmsEventTypes() {}
}

package com.dz.erp.oms.order.domain.model;

/**
 * Finite-state machine for an Order aggregate.
 *
 * <p>See {@code docs/OMS_MODULE.md} §3.1 for the full state diagram and §3.2 for the
 * transition table. Transitions are enforced by {@link Order} itself — no status field
 * may be mutated except via a domain method.
 */
public enum OrderStatus {

    /** Intake persisted; validator not yet run. */
    RECEIVED,

    /** Channel active, products published, customer/address valid. */
    VALIDATED,

    /** Validation failed (terminal). */
    REJECTED,

    /** All lines soft-reserved in Inventory. */
    RESERVED,

    /** At least one line unavailable; Sales Manager notified. */
    AWAITING_STOCK,

    /** SOFT → HARD reservation upgraded. */
    CONFIRMED,

    /** Items picked and boxed by the warehouse; ready for carrier. */
    PACKED,

    /** Shipment submitted to carrier; awaiting pickup. */
    SHIPMENT_REQUESTED,

    /** Carrier has picked up and issued a tracking code. */
    HANDED_TO_CARRIER,

    /** Carrier in transit to the customer. */
    IN_TRANSIT,

    /** Customer delivery confirmed. */
    DELIVERED,

    /** Carrier delivery attempt failed. */
    DELIVERY_FAILED,

    /** Customer-service opened a return request. */
    RETURN_REQUESTED,

    /** Inventory Returns inspection in progress. */
    RETURN_IN_INSPECTION,

    /** Refund issued and stock restocked per disposition (terminal). */
    RETURNED,

    /** Return window elapsed; order closed (terminal). */
    COMPLETED,

    /** Cancelled (user-requested, reservation expired, or return-to-sender; terminal). */
    CANCELLED
}

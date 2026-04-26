package com.dz.erp.oms.integration.domain.model;

/**
 * Normalized carrier event codes. Every adapter translates its provider-specific
 * payload into one of these before handing it to the shipment lifecycle service.
 */
public enum CarrierEvent {
    SUBMITTED,
    PICKED_UP,
    IN_TRANSIT,
    DELIVERED,
    FAILED
}

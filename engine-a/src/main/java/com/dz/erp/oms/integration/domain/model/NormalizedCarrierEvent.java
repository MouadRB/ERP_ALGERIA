package com.dz.erp.oms.integration.domain.model;

import java.time.LocalDateTime;

/**
 * A {@link CarrierEvent} translated out of a carrier-specific webhook payload.
 *
 * @param carrierCode      which carrier produced the event
 * @param eventId          provider-assigned idempotency key (dedupe table)
 * @param trackingNumber   provider tracking number — used to locate the shipment
 * @param event            normalized event type
 * @param reasonCode       optional failure reason (for {@link CarrierEvent#FAILED})
 * @param reasonMessage    optional human-readable reason
 * @param occurredAt       provider timestamp (UTC)
 */
public record NormalizedCarrierEvent(
        String carrierCode,
        String eventId,
        String trackingNumber,
        CarrierEvent event,
        String reasonCode,
        String reasonMessage,
        LocalDateTime occurredAt
) {}

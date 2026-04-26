package com.dz.erp.oms.integration.domain.port;

/**
 * Webhook idempotency store — carriers may retry the same event multiple times.
 * Implementations persist {@code (carrierCode, eventId)} and return {@code false}
 * from {@link #register} when the pair has already been seen.
 */
public interface CarrierWebhookDedupePort {

    boolean register(String carrierCode, String eventId);
}

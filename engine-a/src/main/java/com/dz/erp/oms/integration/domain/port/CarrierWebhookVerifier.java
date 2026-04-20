package com.dz.erp.oms.integration.domain.port;

import com.dz.erp.oms.integration.domain.model.NormalizedCarrierEvent;

import java.util.Map;

/**
 * Verifies and normalizes a webhook payload from a specific carrier. Each carrier
 * has its own signature scheme (HMAC header, basic auth, shared secret, etc.) and
 * its own payload shape — the verifier encapsulates both.
 */
public interface CarrierWebhookVerifier {

    String carrierCode();

    /**
     * Verify signature / auth and translate the raw body into a normalized event.
     *
     * @throws com.dz.erp.shared.exception.BusinessException with
     *         {@code OMS_CARRIER_WEBHOOK_SIGNATURE_INVALID} if the signature fails
     */
    NormalizedCarrierEvent verifyAndNormalize(Map<String, String> headers, String rawBody);
}

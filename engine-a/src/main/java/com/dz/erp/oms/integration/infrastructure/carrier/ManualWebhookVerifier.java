package com.dz.erp.oms.integration.infrastructure.carrier;

import com.dz.erp.oms.integration.domain.model.CarrierEvent;
import com.dz.erp.oms.integration.domain.model.NormalizedCarrierEvent;
import com.dz.erp.oms.integration.domain.port.CarrierWebhookVerifier;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Webhook verifier for the manual / fallback carrier, and the verifier used by
 * operator-driven "simulate event" calls in lower environments.
 *
 * <p>Authenticates with a shared secret passed in the {@code X-Manual-Secret} header.
 * Payload shape (JSON):
 * <pre>
 * {
 *   "eventId": "...",
 *   "trackingNumber": "...",
 *   "event": "PICKED_UP|IN_TRANSIT|DELIVERED|FAILED",
 *   "reasonCode": "...",
 *   "reasonMessage": "...",
 *   "occurredAt": "2025-01-01T10:15:00"
 * }
 * </pre>
 */
@Component
@RequiredArgsConstructor
public class ManualWebhookVerifier implements CarrierWebhookVerifier {

    private static final String SECRET_HEADER = "X-Manual-Secret";

    private final ObjectMapper json;

    @Value("${oms.integration.manual.webhook-secret:manual-secret}")
    private String expectedSecret;

    @Override
    public String carrierCode() { return ManualCarrierAdapter.CODE; }

    @Override
    @SneakyThrows
    public NormalizedCarrierEvent verifyAndNormalize(Map<String, String> headers, String rawBody) {
        var provided = headers.get(SECRET_HEADER);
        if (provided == null) provided = headers.get(SECRET_HEADER.toLowerCase());
        if (provided == null || !provided.equals(expectedSecret)) {
            throw new BusinessException(ErrorCode.OMS_CARRIER_WEBHOOK_SIGNATURE_INVALID, carrierCode());
        }
        JsonNode node = json.readTree(rawBody);
        LocalDateTime at = node.hasNonNull("occurredAt")
                ? LocalDateTime.parse(node.get("occurredAt").asText())
                : LocalDateTime.now();
        return new NormalizedCarrierEvent(
                carrierCode(),
                node.get("eventId").asText(),
                node.get("trackingNumber").asText(),
                CarrierEvent.valueOf(node.get("event").asText()),
                node.hasNonNull("reasonCode") ? node.get("reasonCode").asText() : null,
                node.hasNonNull("reasonMessage") ? node.get("reasonMessage").asText() : null,
                at);
    }
}

package com.dz.erp.oms.integration.infrastructure.carrier.ecotrack;

import com.dz.erp.oms.integration.domain.model.CarrierEvent;
import com.dz.erp.oms.integration.domain.model.NormalizedCarrierEvent;
import com.dz.erp.oms.integration.domain.port.CarrierWebhookVerifier;
import com.dz.erp.oms.integration.infrastructure.carrier.base.HmacSignatureUtil;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "oms.carriers.ecotrack", name = "enabled", havingValue = "true")
public class EcotrackWebhookVerifier implements CarrierWebhookVerifier {

    private static final String SIGNATURE_HEADER = "X-Ecotrack-Signature";

    private final ObjectMapper json;

    @Value("${oms.carriers.ecotrack.webhook-secret:}")
    private String secret;

    @Override
    public String carrierCode() { return EcotrackRestAdapter.CODE; }

    @Override
    @SneakyThrows
    public NormalizedCarrierEvent verifyAndNormalize(Map<String, String> headers, String rawBody) {
        var provided = header(headers, SIGNATURE_HEADER);
        var expected = HmacSignatureUtil.hmacSha256Hex(secret == null ? "" : secret, rawBody);
        if (!HmacSignatureUtil.safeEquals(provided, expected)) {
            throw new BusinessException(ErrorCode.OMS_CARRIER_WEBHOOK_SIGNATURE_INVALID, carrierCode());
        }
        JsonNode n = json.readTree(rawBody);
        return new NormalizedCarrierEvent(
                carrierCode(),
                text(n, "event_id"),
                text(n, "tracking"),
                mapStatus(text(n, "status")),
                text(n, "reason"),
                text(n, "message"),
                n.hasNonNull("occurred_at")
                        ? LocalDateTime.parse(n.get("occurred_at").asText())
                        : LocalDateTime.now());
    }

    private static CarrierEvent mapStatus(String raw) {
        if (raw == null) return CarrierEvent.IN_TRANSIT;
        return switch (raw.toUpperCase()) {
            case "DELIVERED", "LIVRE", "LIVRÉ" -> CarrierEvent.DELIVERED;
            case "PICKED_UP", "COLLECTED" -> CarrierEvent.PICKED_UP;
            case "FAILED", "RETURNED", "REFUSED" -> CarrierEvent.FAILED;
            default -> CarrierEvent.IN_TRANSIT;
        };
    }

    private static String text(JsonNode n, String k) { return n.hasNonNull(k) ? n.get(k).asText() : null; }
    private static String header(Map<String, String> h, String k) {
        var v = h.get(k);
        return v != null ? v : h.get(k.toLowerCase());
    }
}

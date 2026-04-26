package com.dz.erp.oms.integration.infrastructure.carrier.yalidine;

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
import java.util.Set;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "oms.carriers.yalidine", name = "enabled", havingValue = "true")
public class YalidineWebhookVerifier implements CarrierWebhookVerifier {

    private static final String SIGNATURE_HEADER = "X-Yalidine-Signature";

    private final ObjectMapper json;

    @Value("${oms.carriers.yalidine.webhook-secret:}")
    private String secret;

    @Override
    public String carrierCode() { return YalidineRestAdapter.CODE; }

    @Override
    @SneakyThrows
    public NormalizedCarrierEvent verifyAndNormalize(Map<String, String> headers, String rawBody) {
        var provided = header(headers, SIGNATURE_HEADER);
        var expected = HmacSignatureUtil.hmacSha256Hex(secret == null ? "" : secret, rawBody);
        if (!HmacSignatureUtil.safeEquals(provided, expected)) {
            throw new BusinessException(ErrorCode.OMS_CARRIER_WEBHOOK_SIGNATURE_INVALID, carrierCode());
        }
        JsonNode node = json.readTree(rawBody);
        return new NormalizedCarrierEvent(
                carrierCode(),
                text(node, "event_id"),
                text(node, "tracking"),
                mapStatus(text(node, "status")),
                text(node, "reason_code"),
                text(node, "reason_message"),
                node.hasNonNull("occurred_at")
                        ? LocalDateTime.parse(node.get("occurred_at").asText())
                        : LocalDateTime.now());
    }

    private static CarrierEvent mapStatus(String raw) {
        if (raw == null) return CarrierEvent.IN_TRANSIT;
        var s = raw.toUpperCase();
        if (Set.of("DELIVERED", "LIVRÉ", "LIVRE").contains(s)) return CarrierEvent.DELIVERED;
        if (Set.of("PICKED_UP", "RAMASSÉ", "RAMASSE", "COLLECTED").contains(s)) return CarrierEvent.PICKED_UP;
        if (Set.of("FAILED", "RETOUR", "RETURNED", "REFUSED", "UNDELIVERED").contains(s)) return CarrierEvent.FAILED;
        return CarrierEvent.IN_TRANSIT;
    }

    private static String text(JsonNode n, String k) { return n.hasNonNull(k) ? n.get(k).asText() : null; }

    private static String header(Map<String, String> h, String k) {
        var v = h.get(k);
        return v != null ? v : h.get(k.toLowerCase());
    }
}

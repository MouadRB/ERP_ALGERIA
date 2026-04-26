package com.dz.erp.oms.integration.infrastructure.carrier;

import com.dz.erp.oms.integration.domain.port.CarrierPort;
import com.dz.erp.oms.integration.domain.port.CarrierRoutingPort;
import com.dz.erp.oms.integration.domain.port.CarrierWebhookVerifier;
import com.dz.erp.oms.integration.domain.port.OrderWilayaLookupPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Lookup facade — indexes every {@link CarrierPort} and {@link CarrierWebhookVerifier}
 * by {@code carrierCode} and exposes wilaya-aware routing.
 *
 * <p>{@link #resolveForOrder(String, UUID, String)} walks the rules table first:
 * if a rule exists and its target carrier is registered, it wins. Otherwise we fall
 * back to {@code defaultCarrierCode}, and finally to {@link ManualCarrierAdapter} if
 * the default itself is not configured.
 */
@Slf4j
@Component
public class CarrierRouter {

    private final Map<String, CarrierPort> carriers;
    private final Map<String, CarrierWebhookVerifier> verifiers;
    private final CarrierRoutingPort routingRules;
    private final OrderWilayaLookupPort wilayaLookup;

    public CarrierRouter(List<CarrierPort> carriers,
                         List<CarrierWebhookVerifier> verifiers,
                         CarrierRoutingPort routingRules,
                         OrderWilayaLookupPort wilayaLookup) {
        this.carriers = carriers.stream().collect(
                Collectors.toUnmodifiableMap(c -> c.carrierCode().toUpperCase(), c -> c));
        this.verifiers = verifiers.stream().collect(
                Collectors.toUnmodifiableMap(v -> v.carrierCode().toUpperCase(), v -> v));
        this.routingRules = routingRules;
        this.wilayaLookup = wilayaLookup;
    }

    public CarrierPort forCode(String carrierCode) {
        var c = carriers.get(carrierCode.toUpperCase());
        if (c == null) throw new BusinessException(ErrorCode.OMS_CARRIER_NOT_CONFIGURED, carrierCode);
        return c;
    }

    public CarrierWebhookVerifier verifierFor(String carrierCode) {
        var v = verifiers.get(carrierCode.toUpperCase());
        if (v == null) throw new BusinessException(ErrorCode.OMS_CARRIER_NOT_CONFIGURED, carrierCode);
        return v;
    }

    public CarrierPort pickDefault() {
        return forCode(ManualCarrierAdapter.CODE);
    }

    /**
     * Resolve the carrier for an order. Looks up the shipping wilaya, consults the
     * per-tenant rules table, and falls back to {@code defaultCarrierCode} (or the
     * manual adapter) when no rule matches or the matched target is offline.
     */
    public CarrierPort resolveForOrder(String tenantId, UUID orderId, String defaultCarrierCode) {
        var wilaya = wilayaLookup.findShippingWilaya(tenantId, orderId);
        if (wilaya.isPresent()) {
            var byRule = routingRules.resolveCarrierCode(tenantId, wilaya.get())
                    .map(code -> carriers.get(code.toUpperCase()))
                    .orElse(null);
            if (byRule != null) {
                log.debug("Routing order {} (wilaya={}) to carrier {}",
                        orderId, wilaya.get(), byRule.carrierCode());
                return byRule;
            }
        }
        var fallback = carriers.get(defaultCarrierCode == null
                ? ManualCarrierAdapter.CODE
                : defaultCarrierCode.toUpperCase());
        if (fallback != null) return fallback;
        return pickDefault();
    }
}

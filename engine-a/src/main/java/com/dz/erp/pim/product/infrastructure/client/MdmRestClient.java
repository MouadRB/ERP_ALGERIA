package com.dz.erp.pim.product.infrastructure.client;

import com.dz.erp.pim.product.domain.port.MdmClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Component
public class MdmRestClient implements MdmClient {
    private final RestClient rest;

    public MdmRestClient(@Value("${app.mdm.base-url:http://localhost:8080}") String baseUrl) {
        this.rest = RestClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<SkuInfo> validateSku(String skuCode) {
        try {
            var r = rest.get().uri("/mdm/v1/skus/{code}", skuCode).header("Authorization", authHeader())
                    .retrieve().body(Map.class);
            if (r == null || r.get("data") == null) {
                log.info("Auth header sent to MDM: {}", authHeader());
                return Optional.empty();
            }
            var d = (Map<String, Object>) r.get("data");
            return Optional.of(new SkuInfo((String) d.get("skuCode"), (String) d.get("status"), (String) d.get("baseUom"), (String) d.get("productType")));
        } catch (Exception ex) {
            log.warn("MDM SKU validation failed for {}: {}", skuCode, ex.getMessage());
            return Optional.empty();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<SupplierInfo> validateSupplier(String code) {
        try {
            var r = rest.get().uri("/mdm/v1/suppliers/{code}", code).header("Authorization", authHeader())
                    .retrieve().body(Map.class);
            if (r == null || r.get("data") == null) return Optional.empty();
            var d = (Map<String, Object>) r.get("data");
            return Optional.of(new SupplierInfo((String) d.get("supplierCode"), (String) d.get("status"), (String) d.get("companyName")));
        } catch (Exception ex) {
            log.warn("MDM Supplier validation failed for {}: {}", code, ex.getMessage());
            return Optional.empty();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<TaxRateInfo> resolveTaxRate(String categoryCode) {
        try {
            var r = rest.get().uri("/mdm/v1/tax-rules/resolve?category={cat}", categoryCode)
                    .header("Authorization", authHeader()).retrieve().body(Map.class);
            if (r == null || r.get("data") == null) return Optional.empty();
            var d = (Map<String, Object>) r.get("data");
            return Optional.of(new TaxRateInfo((String) d.get("taxRuleCode"), (String) d.get("categoryCode"),
                    new BigDecimal(d.get("taxRate").toString())));
        } catch (Exception ex) {
            log.warn("MDM Tax resolution failed for {}: {}", categoryCode, ex.getMessage());
            return Optional.empty();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<WilayaInfo> getDeliverableWilayas() {
        try {
            var r = rest.get().uri("/mdm/v1/wilayas/deliverable").header("Authorization", authHeader()).retrieve().body(Map.class);
            if (r == null || r.get("data") == null) return List.of();
            return ((List<Map<String, Object>>) r.get("data")).stream().map(d -> new WilayaInfo(
                    (String) d.get("wilayaCode"), (String) d.get("name"), (String) d.get("nameAr"),
                    Boolean.TRUE.equals(d.get("deliverable")), ((Number) d.get("deliveryCostDzd")).intValue())).toList();
        } catch (Exception ex) {
            log.warn("MDM Wilaya fetch failed: {}", ex.getMessage());
            return List.of();
        }
    }

    private String authHeader() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getCredentials() != null ? "Bearer " + auth.getCredentials() : "";
    }
}

package com.dz.erp.catalog.search.infrastructure.client;

import com.dz.erp.catalog.search.shared.port.PimDataPort;
import com.dz.erp.catalog.search.shared.port.dto.PimSnapshots.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * PimDataPort implementation that calls PIM REST endpoints.
 * Since PIM lives in the same engine, calls go to localhost.
 */
@Slf4j
@Component
public class PimRestClient implements PimDataPort {

    private final RestClient rest;

    public PimRestClient(@Value("${app.pim.base-url:http://localhost:8081}") String baseUrl) {
        this.rest = RestClient.builder().baseUrl(baseUrl).build();
    }

    // ── Product ──

    @Override
    @SuppressWarnings("unchecked")
    public PimProductSnapshot getProduct(String skuCode, String token) {
        // Use the search endpoint to find by skuCode (reliable — avoids ambiguous GET /{id} vs /{skuCode})
        var result = rest.get()
                .uri("/pim/v1/products?search={sku}&page=0&size=1", skuCode)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (result == null || result.get("data") == null) return null;

        var dataList = (List<Map<String, Object>>) result.get("data");
        if (dataList.isEmpty()) return null;

        // Find the exact match by skuCode
        var match = dataList.stream()
                .filter(d -> skuCode.equals(d.get("skuCode")))
                .findFirst()
                .orElse(dataList.getFirst());

        return mapProduct(match);
    }

    // ── Variants ──

    @Override
    @SuppressWarnings("unchecked")
    public List<PimVariantSnapshot> getVariants(String skuCode, String token) {
        String productId = resolveProductId(skuCode, token);
        if (productId == null) return List.of();

        var result = rest.get()
                .uri("/pim/v1/products/{productId}/variants", productId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (result == null || result.get("data") == null) return List.of();

        return ((List<Map<String, Object>>) result.get("data")).stream()
                .map(this::mapVariant)
                .toList();
    }

    // ── Pricing ──

    @Override
    @SuppressWarnings("unchecked")
    public PimPricingSnapshot getPricing(String skuCode, String token) {
        String productId = resolveProductId(skuCode, token);
        if (productId == null) return null;

        var result = rest.get()
                .uri("/pim/v1/products/{productId}/pricing", productId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (result == null || result.get("data") == null) return null;

        return mapPricing((Map<String, Object>) result.get("data"));
    }

    // ── Attributes ──

    @Override
    @SuppressWarnings("unchecked")
    public List<PimAttributeSnapshot> getAttributes(String skuCode, String token) {
        String productId = resolveProductId(skuCode, token);
        if (productId == null) return List.of();

        var result = rest.get()
                .uri("/pim/v1/products/{productId}/attributes", productId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (result == null || result.get("data") == null) return List.of();

        return ((List<Map<String, Object>>) result.get("data")).stream()
                .map(this::mapAttribute)
                .toList();
    }

    // ── SEO ──

    @Override
    @SuppressWarnings("unchecked")
    public PimSeoSnapshot getSeo(String skuCode, String token) {
        String productId = resolveProductId(skuCode, token);
        if (productId == null) return null;

        var result = rest.get()
                .uri("/pim/v1/products/{productId}/seo", productId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (result == null || result.get("data") == null) return null;

        return mapSeo((Map<String, Object>) result.get("data"));
    }

    // ── Media ──

    @Override
    @SuppressWarnings("unchecked")
    public List<PimMediaSnapshot> getMedia(String skuCode, String token) {
        String productId = resolveProductId(skuCode, token);
        if (productId == null) return List.of();

        var result = rest.get()
                .uri("/pim/v1/products/{productId}/media", productId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (result == null || result.get("data") == null) return List.of();

        return ((List<Map<String, Object>>) result.get("data")).stream()
                .map(this::mapMedia)
                .toList();
    }

    // ── Internal helpers ──

    /**
     * Resolves a skuCode to a PIM productId by calling the search endpoint.
     */
    @SuppressWarnings("unchecked")
    private String resolveProductId(String skuCode, String token) {
        try {
            var result = rest.get()
                    .uri("/pim/v1/products?search={sku}&page=0&size=1", skuCode)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (result == null || result.get("data") == null) return null;

            var dataList = (List<Map<String, Object>>) result.get("data");
            if (dataList.isEmpty()) return null;

            var match = dataList.stream()
                    .filter(d -> skuCode.equals(d.get("skuCode")))
                    .findFirst()
                    .orElse(dataList.getFirst());

            return (String) match.get("productId");
        } catch (Exception e) {
            log.warn("Failed to resolve productId for SKU {}: {}", skuCode, e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private PimProductSnapshot mapProduct(Map<String, Object> d) {
        return new PimProductSnapshot(
                str(d, "productId"),
                str(d, "skuCode"),
                str(d, "nameFr"),
                str(d, "nameAr"),
                str(d, "descriptionFr"),
                str(d, "descriptionAr"),
                str(d, "brand"),
                str(d, "categoryCode"),
                str(d, "status"),
                intVal(d, "totalStock"),
                decimal(d, "returnRate")
        );
    }

    private PimVariantSnapshot mapVariant(Map<String, Object> d) {
        return new PimVariantSnapshot(
                str(d, "variantId"),
                str(d, "skuCode"),
                str(d, "label"),
                intVal(d, "stockQuantity"),
                decimal(d, "priceOverride")
        );
    }

    private PimPricingSnapshot mapPricing(Map<String, Object> d) {
        return new PimPricingSnapshot(
                decimal(d, "priceTtc"),
                decimal(d, "priceHt"),
                decimal(d, "taxRate"),
                decimal(d, "costFifo"),
                decimal(d, "marginPercent")
        );
    }

    private PimAttributeSnapshot mapAttribute(Map<String, Object> d) {
        return new PimAttributeSnapshot(
                str(d, "key"),
                str(d, "valueFr"),
                str(d, "valueAr")
        );
    }

    @SuppressWarnings("unchecked")
    private PimSeoSnapshot mapSeo(Map<String, Object> d) {
        return new PimSeoSnapshot(
                str(d, "slugFr"),
                str(d, "slugAr"),
                str(d, "metaTitleFr"),
                str(d, "metaTitleAr"),
                d.get("keywords") instanceof List<?> kw ? kw.stream().map(Object::toString).toList() : List.of()
        );
    }

    private PimMediaSnapshot mapMedia(Map<String, Object> d) {
        return new PimMediaSnapshot(
                str(d, "fileUrl"),
                str(d, "mediaType"),
                intVal(d, "position")
        );
    }

    private static String str(Map<String, Object> d, String key) {
        var v = d.get(key);
        return v != null ? v.toString() : null;
    }

    private static int intVal(Map<String, Object> d, String key) {
        var v = d.get(key);
        if (v instanceof Number n) return n.intValue();
        return 0;
    }

    private static BigDecimal decimal(Map<String, Object> d, String key) {
        var v = d.get(key);
        if (v instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        if (v instanceof String s) return new BigDecimal(s);
        return null;
    }
}

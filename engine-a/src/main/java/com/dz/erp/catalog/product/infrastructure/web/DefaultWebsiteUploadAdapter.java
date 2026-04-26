package com.dz.erp.catalog.product.infrastructure.web;

import com.dz.erp.catalog.product.domain.port.WebsiteUploadPort;
import com.dz.erp.catalog.search.domain.model.CatalogProductIndexDocument;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Default website upload adapter — calls a placeholder REST API.
 * Replace this bean with your own implementation when the sales website is ready.
 *
 * Endpoints:
 *   POST   /api/v1/products        → upload single product
 *   POST   /api/v1/products/bulk   → upload batch
 *   DELETE /api/v1/products/{sku}  → remove product
 */
@Slf4j
@Component
public class DefaultWebsiteUploadAdapter implements WebsiteUploadPort {

    private final RestClient rest;

    public DefaultWebsiteUploadAdapter(
            @Value("${app.website.base-url:http://localhost:3000}") String baseUrl) {
        this.rest = RestClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    public boolean upload(CatalogProductIndexDocument product) {
        try {
            rest.post()
                    .uri("/api/v1/products")
                    .body(product)
                    .retrieve()
                    .toBodilessEntity();
            log.debug("Website upload: {} (tenant {})", product.skuCode(), product.tenantId());
            return true;
        } catch (Exception e) {
            log.warn("Website upload failed for {}: {}", product.skuCode(), e.getMessage());
            return false;
        }
    }

    @Override
    public int bulkUpload(List<CatalogProductIndexDocument> products) {
        if (products.isEmpty()) return 0;
        try {
            rest.post()
                    .uri("/api/v1/products/bulk")
                    .body(Map.of("products", products))
                    .retrieve()
                    .toBodilessEntity();
            log.debug("Website bulk upload: {} products", products.size());
            return products.size();
        } catch (Exception e) {
            log.warn("Website bulk upload failed ({} products): {}", products.size(), e.getMessage());
            return 0;
        }
    }

    @Override
    public boolean remove(String skuCode, String tenantId) {
        try {
            rest.delete()
                    .uri("/api/v1/products/{sku}?tenantId={tid}", skuCode, tenantId)
                    .retrieve()
                    .toBodilessEntity();
            log.debug("Website remove: {} (tenant {})", skuCode, tenantId);
            return true;
        } catch (Exception e) {
            log.warn("Website remove failed for {}: {}", skuCode, e.getMessage());
            return false;
        }
    }
}

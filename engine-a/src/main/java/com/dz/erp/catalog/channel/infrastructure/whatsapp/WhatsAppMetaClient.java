package com.dz.erp.catalog.channel.infrastructure.whatsapp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Infrastructure component — HTTP client for Meta Business WhatsApp Catalog API.
 *
 * This is the ONLY class that knows about HTTP, Meta API URLs, and auth tokens.
 * All business logic (filtering, rule evaluation) stays in WhatsAppSyncService (application layer).
 *
 * Retry: 3 attempts with exponential backoff (1s, 2s, 4s).
 * Per-product errors are logged and skipped — partial sync is acceptable.
 *
 * Base URL and token are @Value-configurable for WireMock testing.
 */
@Slf4j
@Component
public class WhatsAppMetaClient {

    private final String baseUrl;
    private final String token;
    private final RestClient restClient;

    private static final int MAX_ATTEMPTS = 3;
    private static final long BASE_DELAY_MS = 1000L;

    public WhatsAppMetaClient(
            @Value("${catalog.whatsapp.meta.base-url:https://graph.facebook.com/v18.0}") String baseUrl,
            @Value("${catalog.whatsapp.meta.token:}") String token) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Push a batch of products to the WhatsApp Business catalog via Meta API.
     *
     * PUT /{catalogId}/products
     *
     * Retries on transient failures with exponential backoff.
     * On 4xx per product: skip that product, log, continue (partial sync OK).
     *
     * @param catalogId  Meta Business catalog ID (e.g., "wh_cat_ferza_01")
     * @param products   list of product payloads to sync
     * @return SyncResult with synced and error counts
     */
    public SyncResult syncProducts(String catalogId, List<Map<String, Object>> products) {
        if (products.isEmpty()) {
            return new SyncResult(0, 0);
        }

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                log.info("WhatsApp Meta API: attempt {}/{} — syncing {} products to catalog {}",
                        attempt, MAX_ATTEMPTS, products.size(), catalogId);

                restClient.post()
                        .uri("/{catalogId}/batch", catalogId)
                        .body(Map.of(
                                "requests", products.stream().map(p -> Map.of(
                                        "method", "UPDATE",
                                        "retailer_id", p.getOrDefault("retailer_id", ""),
                                        "data", p
                                )).toList()
                        ))
                        .retrieve()
                        .toBodilessEntity();

                log.info("WhatsApp Meta API: sync successful — {} products", products.size());
                return new SyncResult(products.size(), 0);

            } catch (Exception e) {
                log.warn("WhatsApp Meta API: attempt {}/{} failed — {}",
                        attempt, MAX_ATTEMPTS, e.getMessage());

                if (attempt < MAX_ATTEMPTS) {
                    long delay = BASE_DELAY_MS * (1L << (attempt - 1)); // 1s, 2s, 4s
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("WhatsApp Meta API: retry interrupted");
                        break;
                    }
                }
            }
        }

        log.error("WhatsApp Meta API: all {} attempts failed for catalog {}", MAX_ATTEMPTS, catalogId);
        return new SyncResult(0, products.size());
    }

    /**
     * Result of a sync batch operation.
     */
    public record SyncResult(int synced, int errors) {}
}

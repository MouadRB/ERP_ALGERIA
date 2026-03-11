package com.dz.erp.shared.outbox;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Reads targets from application.yml.
 *
 * Each target has a routes map: eventType → url.
 * Use "*" as a key to catch all events not explicitly listed.
 *
 * Example:
 *
 * app:
 *   outbox:
 *     targets:
 *       - name: engine-b
 *         routes:
 *           "*": http://localhost:8082/api/events/ingest
 *
 *       - name: payment-gateway
 *         routes:
 *           ORDER_CREATED: https://pay.example.com/webhooks/orders
 *           ORDER_CANCELLED: https://pay.example.com/webhooks/cancellations
 *
 *       - name: engine-b-crm
 *         routes:
 *           SKU_REGISTERED: http://localhost:8083/api/mdm/skus/registered
 *           SKU_ACTIVATED: http://localhost:8083/api/mdm/skus/activated
 *           SUPPLIER_REGISTERED: http://localhost:8083/api/procurement/suppliers/new
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.outbox")
public class OutboxProperties {

    private long pollIntervalMs = 1000;
    private int batchSize = 50;
    private int retryMax = 3;
    private long timeoutMs = 5000;
    private List<Target> targets = new ArrayList<>();

    @Getter
    @Setter
    public static class Target {
        private String name;
        private Map<String, String> routes = new HashMap<>();  // eventType → url

        /**
         * Does this target want this event type?
         * Match if: exact key exists OR "*" wildcard exists.
         */
        public boolean accepts(String eventType) {
            return routes.containsKey(eventType) || routes.containsKey("DEFAULT");
        }

        /**
         * Get the URL for this event type.
         * Exact match first, then "*" fallback, then null.
         */
        public String urlFor(String eventType) {
            String url = routes.get(eventType);
            if (url != null) return url;
            return routes.get("DEFAULT");
        }
    }
}

package com.dz.erp.catalog.channel.application;

import com.dz.erp.catalog.channel.application.dto.SyncJobResponse;
import com.dz.erp.catalog.channel.application.dto.SyncStatusResponse;
import com.dz.erp.catalog.channel.domain.event.ChannelDomainEvent;
import com.dz.erp.catalog.channel.domain.model.SalesChannel;
import com.dz.erp.catalog.channel.domain.model.SalesChannelRules;
import com.dz.erp.catalog.channel.domain.port.ChannelEventPort;
import com.dz.erp.catalog.channel.domain.port.SalesChannelRepository;
import com.dz.erp.catalog.channel.infrastructure.whatsapp.WhatsAppMetaClient;
import com.dz.erp.catalog.product.domain.model.CatalogProduct;
import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.search.shared.port.CatalogCachePort;
import com.dz.erp.catalog.search.shared.port.PimDataPort;
import com.dz.erp.catalog.search.shared.port.dto.PimSnapshots.*;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Application service — orchestrates WhatsApp catalog sync.
 *
 * Lives in the application layer (not infrastructure) because it orchestrates
 * business logic: loading channels, applying rules, filtering products,
 * recording sync results.
 *
 * The actual HTTP call to Meta API is delegated to WhatsAppMetaClient (infrastructure).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppSyncService {

    private final SalesChannelRepository channelRepo;
    private final CatalogProductRepository productRepo;
    private final PimDataPort pimDataPort;
    private final WhatsAppMetaClient metaClient;
    private final ChannelEventPort channelEventPort;
    private final CatalogCachePort cachePort;

    /**
     * Trigger a full WhatsApp sync for a specific tenant.
     *
     * 1. Load WHATSAPP SalesChannel → get rules
     * 2. Fetch all PUBLISHED products with channelWhatsapp=true
     * 3. Apply WhatsApp exclusion filters (price cap, min price, image, variants)
     * 4. Build payload and send to Meta API
     * 5. Record sync result on domain → fire event → audit trail
     */
    @Transactional
    public SyncJobResponse triggerSync(String tenantId) {
        long start = System.currentTimeMillis();

        var channelOpt = channelRepo.findByChannelTypeAndTenantId(ChannelType.WHATSAPP, tenantId);
        if (channelOpt.isEmpty() || !channelOpt.get().isActive()) {
            return new SyncJobResponse(0, 0, 0, 0);
        }

        var channel = channelOpt.get();
        var rules = channel.getRules();

        // Resolve JWT token — may be null when running from scheduler
        var token = resolveToken();

        // Load all PUBLISHED products assigned to WhatsApp channel
        var allProducts = productRepo.findPublishedByChannelAndTenantId(ChannelType.WHATSAPP, tenantId);

        var eligible = new ArrayList<Map<String, Object>>();
        int excluded = 0;

        for (var product : allProducts) {
            var exclusionReason = evaluateWhatsAppExclusion(product, rules, tenantId, token);
            if (exclusionReason != null) {
                excluded++;
                log.debug("WhatsApp sync: excluded {} — {}", product.getSkuCode(), exclusionReason);
                continue;
            }

            eligible.add(buildWhatsAppPayload(product, token));
        }

        // Send to Meta Business API (infrastructure layer handles HTTP + retry)
        var result = eligible.isEmpty()
                ? new WhatsAppMetaClient.SyncResult(0, 0)
                : metaClient.syncProducts(channel.getCatalogId(), eligible);

        long duration = System.currentTimeMillis() - start;

        // Record sync on domain
        channel.recordSync(LocalDateTime.now(), result.synced(), result.errors(), excluded, duration);
        channelRepo.save(channel);

        // Publish event explicitly
        channelEventPort.publish("SYNC_COMPLETED", ChannelType.WHATSAPP.name(),
                new ChannelDomainEvent.SyncCompleted(ChannelType.WHATSAPP,
                        result.synced(), excluded, result.errors(), duration, tenantId));

        // Evict WhatsApp-related caches
        cachePort.evictByPattern("catalog:products:WHATSAPP:*");
        cachePort.evictByPattern("catalog:stats:*");

        log.info("WhatsApp sync complete for tenant {}: {} synced, {} excluded, {} errors, {}ms",
                tenantId, result.synced(), excluded, result.errors(), duration);

        return new SyncJobResponse(result.synced(), excluded, result.errors(), duration);
    }

    /**
     * Get current sync status for the WhatsApp channel.
     */
    @Transactional(readOnly = true)
    public SyncStatusResponse getSyncStatus(String tenantId) {
        var channel = channelRepo.findByChannelTypeAndTenantId(ChannelType.WHATSAPP, tenantId)
                .orElse(null);
        if (channel == null) {
            return new SyncStatusResponse(null, 0, 0, null);
        }

        var nextSync = channel.getLastSyncAt() != null
                ? channel.getLastSyncAt().plusMinutes(channel.getSyncFrequencyMinutes())
                : null;

        return new SyncStatusResponse(
                channel.getLastSyncAt(),
                channel.getLastSyncProductCount(),
                channel.getLastSyncErrorCount(),
                nextSync
        );
    }

    /**
     * Scheduled auto-sync — iterates ALL tenants with an active WhatsApp channel.
     * Not hardcoded to a single tenant.
     */
    @Scheduled(fixedDelayString = "${catalog.whatsapp.sync.delay:7200000}")
    public void autoSync() {
        var tenantIds = channelRepo.findTenantIdsWithActiveChannel(ChannelType.WHATSAPP);
        log.info("WhatsApp auto-sync: processing {} tenants", tenantIds.size());

        for (var tenantId : tenantIds) {
            try {
                triggerSync(tenantId);
            } catch (Exception e) {
                log.error("WhatsApp auto-sync failed for tenant {}: {}", tenantId, e.getMessage(), e);
            }
        }
    }

    // ──────────────────────────────────────────────
    // Private — WhatsApp rule evaluation
    // ──────────────────────────────────────────────

    /**
     * Resolve JWT token from security context. Returns null if no auth context
     * (e.g., when running from scheduler).
     */
    private String resolveToken() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getCredentials() instanceof String jwt) {
            return jwt;
        }
        return null;
    }

    /**
     * Evaluate all WhatsApp exclusion rules against a product.
     * Returns the exclusion reason, or null if the product passes all rules.
     */
    private String evaluateWhatsAppExclusion(CatalogProduct product, SalesChannelRules rules,
                                             String tenantId, String token) {
        if (token == null) {
            // No JWT available (scheduler context) — skip PIM-dependent rules
            return null;
        }

        // Rule: exclude if price outside allowed range
        if (rules.maxPriceDzd() != null || rules.minPriceDzd() != null) {
            var priceTtc = fetchPriceTtc(product.getSkuCode(), token);
            if (priceTtc != null) {
                if (rules.maxPriceDzd() != null && priceTtc > rules.maxPriceDzd()) {
                    return "PRICE_ABOVE_CAP: " + priceTtc + " > " + rules.maxPriceDzd();
                }
                if (rules.minPriceDzd() != null && priceTtc < rules.minPriceDzd()) {
                    return "PRICE_BELOW_MIN: " + priceTtc + " < " + rules.minPriceDzd();
                }
            }
        }

        // Rule: exclude if no principal image
        if (!hasPrincipalImage(product.getSkuCode(), token)) {
            return "NO_PRINCIPAL_IMAGE";
        }

        // Rule: exclude individual variants (parent only)
        if (rules.excludeVariantsIndividual()) {
            var variants = pimDataPort.getVariants(product.getSkuCode(), token);
            if (variants != null && !variants.isEmpty()) {
                return "VARIANT_EXCLUDED: product has " + variants.size() + " variants";
            }
        }

        // Rule: exclude zero stock (safety net in case of race condition)
        if (rules.autoMaskOnZeroStock()) {
            var pimProduct = pimDataPort.getProduct(product.getSkuCode(), token);
            if (pimProduct != null && pimProduct.totalStock() <= 0) {
                return "ZERO_STOCK: stock is " + pimProduct.totalStock();
            }
        }

        return null; // passes all rules
    }

    /**
     * Build a WhatsApp catalog payload for one product.
     * FR+AR names, price, image URL, SKU code.
     */
    private Map<String, Object> buildWhatsAppPayload(CatalogProduct product, String token) {
        var payload = new java.util.HashMap<String, Object>();

        payload.put("retailer_id", product.getSkuCode());
        payload.put("category_id", product.getCategoryId() != null ? product.getCategoryId().toString() : "");

        // Fetch names from PIM
        try {
            var pimProduct = pimDataPort.getProduct(product.getSkuCode(), token);
            if (pimProduct != null) {
                payload.put("name", pimProduct.nameFr());
                payload.put("name_ar", pimProduct.nameAr());
            }
        } catch (Exception e) {
            log.warn("WhatsApp payload: failed to fetch product names for {}", product.getSkuCode());
        }

        // Fetch price from PIM
        try {
            var pricing = pimDataPort.getPricing(product.getSkuCode(), token);
            if (pricing != null) {
                payload.put("price", pricing.priceTtc().toPlainString() + " DZD");
            }
        } catch (Exception e) {
            log.warn("WhatsApp payload: failed to fetch price for {}", product.getSkuCode());
        }

        // Fetch principal image URL from PIM
        try {
            var media = pimDataPort.getMedia(product.getSkuCode(), token);
            if (media != null) {
                media.stream()
                        .filter(m -> "PRINCIPAL".equals(m.mediaType()))
                        .findFirst()
                        .ifPresent(m -> payload.put("image_url", m.fileUrl()));
            }
        } catch (Exception e) {
            log.warn("WhatsApp payload: failed to fetch media for {}", product.getSkuCode());
        }

        return payload;
    }

    /**
     * Fetch price TTC from PIM via REST. Returns null if unavailable.
     */
    private Integer fetchPriceTtc(String skuCode, String token) {
        try {
            var pricing = pimDataPort.getPricing(skuCode, token);
            return pricing != null ? pricing.priceTtc().intValue() : null;
        } catch (Exception e) {
            log.warn("Failed to fetch price for {}: {}", skuCode, e.getMessage());
            return null;
        }
    }

    /**
     * Check if the product has a principal image via PIM REST.
     */
    private boolean hasPrincipalImage(String skuCode, String token) {
        try {
            var media = pimDataPort.getMedia(skuCode, token);
            return media != null && media.stream().anyMatch(m -> "PRINCIPAL".equals(m.mediaType()));
        } catch (Exception e) {
            log.warn("Failed to fetch media for {}: {}", skuCode, e.getMessage());
            return false; // conservative — exclude if we can't verify
        }
    }
}

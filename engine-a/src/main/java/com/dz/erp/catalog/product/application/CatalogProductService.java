package com.dz.erp.catalog.product.application;

import com.dz.erp.catalog.product.application.dto.*;
import com.dz.erp.catalog.product.domain.event.CatalogDomainEvent;
import com.dz.erp.catalog.product.domain.model.CatalogProduct;
import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.product.infrastructure.event.CatalogProductEventPublisher;
import com.dz.erp.catalog.product.infrastructure.mapper.CatalogProductResponseMapper;
import com.dz.erp.catalog.search.shared.port.PimDataPort;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.MaskedReason;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogProductService {

    private final CatalogProductRepository productRepo;
    private final CatalogProductEventPublisher eventPublisher;
    private final CatalogProductResponseMapper responseMapper;
    private final PimDataPort pimDataPort;

    // ── Publish ──
    @Transactional
    public CatalogProductResponse publishProduct(PublishProductCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var actorId = AuthContext.currentUserId();
        var token = AuthContext.getJwt();

        // Verify PIM prerequisites before publishing
        try {
            var pimProduct = pimDataPort.getProduct(cmd.skuCode(), token);
            if (pimProduct == null) {
                throw new BusinessException(ErrorCode.CATALOG_ENTRY_NOT_FOUND, "PIM product not found: " + cmd.skuCode());
            }
            if (pimProduct.totalStock() <= 0) {
                throw new BusinessException(ErrorCode.CATALOG_PUBLISH_BLOCKED, "No available stock for " + cmd.skuCode());
            }

            var pricing = pimDataPort.getPricing(cmd.skuCode(), token);
            if (pricing == null || pricing.priceTtc().signum() <= 0) {
                throw new BusinessException(ErrorCode.CATALOG_PUBLISH_BLOCKED, "Price must be > 0 for " + cmd.skuCode());
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("PIM verification failed for {}, proceeding with publish: {}", cmd.skuCode(), e.getMessage());
        }

        var product = findOrThrow(cmd.skuCode(), tid);
        product.publish(actorId, cmd.channels());
        product = productRepo.save(product);

        eventPublisher.publish("PRODUCT_PUBLISHED", product.getSkuCode(),
                new CatalogDomainEvent.ProductPublished(product.getSkuCode(), Set.copyOf(cmd.channels()), actorId, tid));

        log.info("Product {} published on channels {}", cmd.skuCode(), cmd.channels());
        return responseMapper.toResponse(product);
    }

    // ── Unpublish (manual mask) ──
    @Transactional
    public CatalogProductResponse unpublishProduct(UnpublishProductCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var actorId = AuthContext.currentUserId();
        var product = findOrThrow(cmd.skuCode(), tid);
        product.maskManual(actorId);
        product = productRepo.save(product);

        eventPublisher.publish("PRODUCT_MASKED_MANUAL", product.getSkuCode(),
                new CatalogDomainEvent.ProductMaskedManual(product.getSkuCode(), actorId, tid));

        log.info("Product {} unpublished by {}", cmd.skuCode(), actorId);
        return responseMapper.toResponse(product);
    }

    // ── Schedule ──
    @Transactional
    public CatalogProductResponse schedulePublication(SchedulePublicationCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var product = findOrThrow(cmd.skuCode(), tid);
        product.schedule(cmd.scheduledAt());
        product = productRepo.save(product);

        eventPublisher.publish("PRODUCT_SCHEDULED", product.getSkuCode(),
                new CatalogDomainEvent.ProductScheduled(product.getSkuCode(), cmd.scheduledAt(), tid));

        log.info("Product {} scheduled for {}", cmd.skuCode(), cmd.scheduledAt());
        return responseMapper.toResponse(product);
    }

    // ── Cancel schedule ──
    @Transactional
    public CatalogProductResponse cancelSchedule(String skuCode) {
        var tid = AuthContext.currentTenantId();
        var actorId = AuthContext.currentUserId();
        var product = findOrThrow(skuCode, tid);
        product.cancelSchedule(actorId);
        product = productRepo.save(product);

        eventPublisher.publish("SCHEDULE_CANCELLED", product.getSkuCode(),
                new CatalogDomainEvent.ScheduleCancelled(product.getSkuCode(), actorId, tid));

        log.info("Product {} schedule cancelled", skuCode);
        return responseMapper.toResponse(product);
    }

    // ── Toggle channel ──
    @Transactional
    public CatalogProductResponse toggleChannel(ToggleChannelCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var product = findOrThrow(cmd.skuCode(), tid);
        product.toggleChannel(cmd.channel(), cmd.enabled());
        product = productRepo.save(product);

        eventPublisher.publish("CHANNEL_CHANGED", product.getSkuCode(),
                new CatalogDomainEvent.ChannelChanged(product.getSkuCode(), cmd.channel(), cmd.enabled(), tid));

        return responseMapper.toResponse(product);
    }

    // ── Toggle rule ──
    @Transactional
    public CatalogProductResponse toggleRule(ToggleRuleCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var product = findOrThrow(cmd.skuCode(), tid);
        product.toggleRule(cmd.rule(), cmd.enabled());
        product = productRepo.save(product);

        eventPublisher.publish("RULE_TOGGLED", product.getSkuCode(),
                new CatalogDomainEvent.RuleToggled(product.getSkuCode(), cmd.rule(), cmd.enabled(), tid));

        return responseMapper.toResponse(product);
    }

    // ── Diagnostic ──
    @Transactional(readOnly = true)
    public DiagnosticResponse getDiagnostic(String skuCode) {
        var tid = AuthContext.currentTenantId();
        var token = AuthContext.getJwt();
        var product = findOrThrow(skuCode, tid);

        boolean pimActive = false;
        boolean hasStock = false;
        boolean hasPrice = false;
        boolean notOcrDraft = true;

        try {
            var pimProduct = pimDataPort.getProduct(skuCode, token);
            if (pimProduct != null) {
                pimActive = true;
                hasStock = pimProduct.totalStock() > 0;
            }
        } catch (Exception e) {
            log.warn("Diagnostic: PIM product fetch failed for {}: {}", skuCode, e.getMessage());
        }

        try {
            var pricing = pimDataPort.getPricing(skuCode, token);
            hasPrice = pricing != null && pricing.priceTtc().signum() > 0;
        } catch (Exception e) {
            log.warn("Diagnostic: PIM pricing fetch failed for {}: {}", skuCode, e.getMessage());
        }

        boolean hasChannels = !product.getActiveChannels().isEmpty();

        var result = product.computeDiagnosticScore(pimActive, hasStock, hasPrice, notOcrDraft, hasChannels);
        String verdict = result.totalScore().compareTo(new java.math.BigDecimal("0.50")) >= 0
                ? "VISIBLE" : "NON VISIBLE — vérifier PIM";

        return new DiagnosticResponse(skuCode, result.totalScore(), result.checks(), verdict);
    }

    // ── Get product detail ──
    @Transactional(readOnly = true)
    public CatalogProductResponse getProductDetail(String skuCode) {
        return responseMapper.toResponse(findOrThrow(skuCode, AuthContext.currentTenantId()));
    }

    // ── Bulk action ──
    @Transactional
    public BulkActionResponse bulkAction(BulkActionCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var actorId = AuthContext.currentUserId();
        var results = new ArrayList<BulkActionResponse.SkuResult>();
        int success = 0, failed = 0;

        for (var sku : cmd.skuCodes()) {
            try {
                var product = findOrThrow(sku, tid);
                switch (cmd.action()) {
                    case PUBLISH -> {
                        var channels = cmd.channels() != null ? cmd.channels() : EnumSet.of(ChannelType.WEB);
                        product.publish(actorId, channels);
                        productRepo.save(product);
                        eventPublisher.publish("PRODUCT_PUBLISHED", sku,
                                new CatalogDomainEvent.ProductPublished(sku, Set.copyOf(channels), actorId, tid));
                    }
                    case UNPUBLISH -> {
                        product.maskManual(actorId);
                        productRepo.save(product);
                        eventPublisher.publish("PRODUCT_MASKED_MANUAL", sku,
                                new CatalogDomainEvent.ProductMaskedManual(sku, actorId, tid));
                    }
                    case SCHEDULE -> {} // requires scheduledAt — skip in bulk for now
                    case CHANGE_CHANNEL -> {
                        if (cmd.channels() != null) {
                            product.getActiveChannels().forEach(ch -> product.toggleChannel(ch, false));
                            cmd.channels().forEach(ch -> product.toggleChannel(ch, true));
                            productRepo.save(product);
                            for (var ch : cmd.channels()) {
                                eventPublisher.publish("CHANNEL_CHANGED", sku,
                                        new CatalogDomainEvent.ChannelChanged(sku, ch, true, tid));
                            }
                        }
                    }
                }
                results.add(new BulkActionResponse.SkuResult(sku, true, null));
                success++;
            } catch (Exception e) {
                results.add(new BulkActionResponse.SkuResult(sku, false, e.getMessage()));
                failed++;
            }
        }

        log.info("Bulk action {}: {}/{} success", cmd.action(), success, cmd.skuCodes().size());
        return new BulkActionResponse(cmd.skuCodes().size(), success, failed, results);
    }

    // ── Helpers ──
    private CatalogProduct findOrThrow(String skuCode, String tenantId) {
        return productRepo.findBySkuCodeAndTenantId(skuCode, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATALOG_ENTRY_NOT_FOUND, skuCode));
    }
}

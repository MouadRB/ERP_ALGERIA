package com.dz.erp.pim.variant.application;

import com.dz.erp.pim.product.domain.port.MdmClient;
import com.dz.erp.pim.product.domain.port.ProductRepository;
import com.dz.erp.pim.variant.application.dto.*;
import com.dz.erp.pim.variant.domain.event.VariantDomainEvent;
import com.dz.erp.pim.variant.domain.model.Variant;
import com.dz.erp.pim.variant.domain.model.VariantStatus;
import com.dz.erp.pim.variant.domain.port.VariantEventPort;
import com.dz.erp.pim.variant.domain.port.VariantRepository;
import com.dz.erp.pim.variant.infrastructure.mapper.VariantResponseMapper;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VariantService {
    private final VariantRepository variantRepo;
    private final ProductRepository productRepo;
    private final VariantEventPort eventPort;
    private final VariantResponseMapper mapper;

    @Transactional
    public VariantResponse create(String productId, CreateVariantCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        productRepo.findById(productId, tid).orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, productId));

        if (variantRepo.existsBySkuCode(cmd.skuCode().trim().toUpperCase(), tid))
            throw new BusinessException(ErrorCode.VARIANT_DUPLICATE_SKU, cmd.skuCode());

        var variant = Variant.create(productId, tid, cmd.skuCode(), cmd.label(), cmd.barcode(),
                cmd.priceOverride(), cmd.costOverride(), cmd.stockThreshold(), uid);
        variant = variantRepo.save(variant);
        productRepo.findById(productId, tid).ifPresent(p -> {
            p.incrementVariantCount();
            productRepo.save(p);
        });
        eventPort.publish("VARIANT_CREATED", variant.getVariantId(),
                new VariantDomainEvent.Created(UUID.randomUUID().toString(), "VARIANT_CREATED", 1,
                        tid, "Variant", variant.getVariantId(), Instant.now(), productId, variant.getSkuCode(), uid));
        return mapper.toResponse(variant);
    }

    @Transactional
    public VariantResponse update(String variantId, UpdateVariantCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var variant = findOrThrow(variantId, tid);
        variant.update(cmd.label(), cmd.barcode(), cmd.priceOverride(), cmd.costOverride(), cmd.stockThreshold(), uid);
        return mapper.toResponse(variantRepo.save(variant));
    }

    @Transactional
    public void delete(String productId, String variantId) {
        var tid = AuthContext.currentTenantId();
        var variant = findOrThrow(variantId, tid);
        if (variant.hasStock()) throw new BusinessException(ErrorCode.VARIANT_HAS_STOCK);
        variantRepo.delete(variant);
        productRepo.findById(productId, tid).ifPresent(p -> {
            p.decrementVariantCount();
            productRepo.save(p);
        });
    }

    @Transactional(readOnly = true)
    public List<VariantResponse> listByProduct(String productId) {
        return variantRepo.findByProductId(productId, AuthContext.currentTenantId()).stream().map(mapper::toResponse).toList();
    }

    /**
     * Internal — called by ProductService for totalStock recalculation
     */
    @Transactional(readOnly = true)
    public List<VariantResponse> listByProductInternal(String productId, String tenantId) {
        return variantRepo.findByProductId(productId, tenantId).stream().map(mapper::toResponse).toList();
    }

    /**
     * Called by ProductIntraEngineEventListener on StockUpdated from Inventory
     */
    @Transactional
    public void updateStockFromInventory(String skuCode, String tenantId, int newQuantity) {
        variantRepo.findBySkuCode(skuCode, tenantId).ifPresent(v -> {
            v.updateStockFromInventory(newQuantity);
            v.activate(v.getStockQuantity());
            variantRepo.save(v);
            log.info("Variant stock updated: SKU {} → {} units", skuCode, newQuantity);
        });
    }

    private Variant findOrThrow(String id, String tid) {
        return variantRepo.findById(id, tid).orElseThrow(() -> new BusinessException(ErrorCode.VARIANT_NOT_FOUND, id));
    }
}

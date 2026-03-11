package com.dz.erp.mdm.sku.application;

import com.dz.erp.mdm.sku.application.dto.*;
import com.dz.erp.mdm.sku.domain.event.SkuDomainEvent;
import com.dz.erp.mdm.sku.domain.model.ProductType;
import com.dz.erp.mdm.sku.domain.model.Sku;
import com.dz.erp.mdm.sku.domain.port.SkuEventPort;
import com.dz.erp.mdm.sku.domain.port.SkuRepository;
import com.dz.erp.mdm.sku.infrastructure.mapper.SkuResponseMapper;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkuService {

    private final SkuRepository skuRepository;
    private final SkuEventPort eventPort;
    private final SkuResponseMapper mapper;

    @Transactional
    public SkuResponse register(RegisterSkuCommand cmd) {
        var tenantId = AuthContext.currentTenantId();
        var userId = AuthContext.currentUserId();
        if (skuRepository.existsBySkuCode(cmd.skuCode().trim().toUpperCase(), tenantId))
            throw new BusinessException(ErrorCode.SKU_DUPLICATE, cmd.skuCode());
        var sku = Sku.create(cmd.skuCode(), tenantId, cmd.baseUom(),
                ProductType.valueOf(cmd.productType()), userId);
        sku = skuRepository.save(sku);
        eventPort.publish("SKU_REGISTERED", sku.getSkuCode(),
                new SkuDomainEvent.Registered(UUID.randomUUID().toString(), "SKU_REGISTERED", 1,
                        tenantId, "Sku", sku.getSkuCode(), Instant.now(),
                        sku.getSkuCode(), sku.getBaseUom(), sku.getProductType().name(), userId));
        log.info("SKU registered: {}", sku.getSkuCode());
        return mapper.toResponse(sku);
    }

    @Transactional
    public SkuResponse update(String skuCode, UpdateSkuCommand cmd) {
        var tenantId = AuthContext.currentTenantId();
        var userId = AuthContext.currentUserId();
        var sku = findOrThrow(skuCode, tenantId);
        sku.update(cmd.baseUom(), cmd.productType() != null ? ProductType.valueOf(cmd.productType()) : null, userId);
        sku = skuRepository.save(sku);
        eventPort.publish("SKU_UPDATED", sku.getSkuCode(),
                new SkuDomainEvent.Updated(UUID.randomUUID().toString(), "SKU_UPDATED", 1,
                        tenantId, "Sku", sku.getSkuCode(), Instant.now(), sku.getSkuCode(), userId));
        return mapper.toResponse(sku);
    }

    @Transactional
    public SkuResponse activate(String skuCode) {
        var tenantId = AuthContext.currentTenantId();
        var userId = AuthContext.currentUserId();
        var sku = findOrThrow(skuCode, tenantId);
        sku.activate(userId);
        sku = skuRepository.save(sku);
        eventPort.publish("SKU_ACTIVATED", sku.getSkuCode(),
                new SkuDomainEvent.Activated(UUID.randomUUID().toString(), "SKU_ACTIVATED", 1,
                        tenantId, "Sku", sku.getSkuCode(), Instant.now(), sku.getSkuCode(), userId));
        return mapper.toResponse(sku);
    }

    @Transactional
    public SkuResponse discontinue(String skuCode) {
        var tenantId = AuthContext.currentTenantId();
        var userId = AuthContext.currentUserId();
        var sku = findOrThrow(skuCode, tenantId);
        sku.discontinue(userId);
        sku = skuRepository.save(sku);
        eventPort.publish("SKU_DISCONTINUED", sku.getSkuCode(),
                new SkuDomainEvent.Discontinued(UUID.randomUUID().toString(), "SKU_DISCONTINUED", 1,
                        tenantId, "Sku", sku.getSkuCode(), Instant.now(), sku.getSkuCode(), userId));
        return mapper.toResponse(sku);
    }

    @Transactional(readOnly = true)
    public SkuResponse getByCode(String skuCode) {
        return mapper.toResponse(findOrThrow(skuCode, AuthContext.currentTenantId()));
    }

    @Transactional(readOnly = true)
    public Page<SkuResponse> search(SkuSearchQuery q) {
        var pageable = PageRequest.of(q.page(), q.size(), Sort.by("createdAt").descending());
        return skuRepository.search(q.searchTerm(), q.status(), AuthContext.currentTenantId(), pageable)
                .map(mapper::toResponse);
    }

    private Sku findOrThrow(String skuCode, String tenantId) {
        return skuRepository.findBySkuCode(skuCode, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SKU_NOT_FOUND, skuCode));
    }
}

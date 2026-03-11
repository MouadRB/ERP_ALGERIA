package com.dz.erp.mdm.sku.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.time.Instant;
import java.util.Objects;

@Getter
@EqualsAndHashCode(of = {"skuCode", "tenantId"})
public class Sku {

    private final String skuCode;
    private final String tenantId;
    private String baseUom;
    private ProductType productType;
    private SkuStatus status;
    private final String createdBy;
    private final Instant createdAt;
    private String updatedBy;
    private Instant updatedAt;
    private long version;

    public static Sku create(String skuCode, String tenantId, String baseUom,
                             ProductType productType, String createdBy) {
        return new Sku(Objects.requireNonNull(skuCode).trim().toUpperCase(), tenantId,
                Objects.requireNonNull(baseUom), Objects.requireNonNull(productType),
                SkuStatus.DRAFT, Objects.requireNonNull(createdBy), Instant.now(), null, null, 0);
    }

    public static Sku reconstitute(String skuCode, String tenantId, String baseUom,
                                   ProductType productType, SkuStatus status,
                                   String createdBy, Instant createdAt,
                                   String updatedBy, Instant updatedAt, long version) {
        return new Sku(skuCode, tenantId, baseUom, productType, status,
                createdBy, createdAt, updatedBy, updatedAt, version);
    }

    private Sku(String skuCode, String tenantId, String baseUom, ProductType productType,
                SkuStatus status, String createdBy, Instant createdAt,
                String updatedBy, Instant updatedAt, long version) {
        this.skuCode = skuCode;
        this.tenantId = tenantId;
        this.baseUom = baseUom;
        this.productType = productType;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    public void activate(String activatorId) {
        if (status == SkuStatus.ACTIVE) throw new BusinessException(ErrorCode.SKU_ALREADY_ACTIVE);
        if (status != SkuStatus.DRAFT)
            throw new BusinessException(ErrorCode.SKU_INVALID_TRANSITION, status, SkuStatus.ACTIVE);
        if (createdBy.equals(activatorId)) throw new BusinessException(ErrorCode.SKU_SOD_VIOLATION);
        this.status = SkuStatus.ACTIVE;
        touch(activatorId);
    }

    public void discontinue(String actorId) {
        if (status == SkuStatus.DISCONTINUED) throw new BusinessException(ErrorCode.SKU_ALREADY_DISCONTINUED);
        if (status != SkuStatus.ACTIVE)
            throw new BusinessException(ErrorCode.SKU_INVALID_TRANSITION, status, SkuStatus.DISCONTINUED);
        this.status = SkuStatus.DISCONTINUED;
        touch(actorId);
    }

    public void update(String baseUom, ProductType productType, String actorId) {
        if (status != SkuStatus.DRAFT) throw new BusinessException(ErrorCode.SKU_NOT_EDITABLE);
        if (baseUom != null) this.baseUom = baseUom;
        if (productType != null) this.productType = productType;
        touch(actorId);
    }

    private void touch(String actorId) {
        this.updatedBy = actorId;
        this.updatedAt = Instant.now();
    }
}

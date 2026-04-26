package com.dz.erp.catalog.product.infrastructure.mapper;

import com.dz.erp.catalog.product.application.dto.CatalogProductResponse;
import com.dz.erp.catalog.product.domain.model.CatalogProduct;
import org.springframework.stereotype.Component;

@Component
public class CatalogProductResponseMapper {

    public CatalogProductResponse toResponse(CatalogProduct p) {
        return new CatalogProductResponse(
                p.getId(), p.getSkuCode(), p.getCategoryId(), p.getTenantId(),
                p.getStatus(), p.getMaskedReason(),
                p.getActiveChannels(), p.getActiveRules(),
                p.getScheduledAt(), p.getAutoUnpublishAt(),
                p.isFeaturedHomepage(), p.isBadgeStockLimit(), p.getStockLimitThreshold(),
                p.isIncludeInSponsoredSearch(), p.getVisibilityScore(),
                p.getCreatedAt(), p.getUpdatedAt());
    }
}

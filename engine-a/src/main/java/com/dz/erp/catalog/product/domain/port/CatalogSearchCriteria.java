package com.dz.erp.catalog.product.domain.port;

import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.PublicationStatus;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Search criteria for paginated catalog product queries.
 * Used by CatalogProductRepository.search().
 */
public record CatalogSearchCriteria(
    String tenantId,
    PublicationStatus status,
    UUID categoryId,
    ChannelType channel,
    String stockFilter,
    BigDecimal priceMin,
    BigDecimal priceMax,
    String warehouseId,
    String keyword
) {}

package com.dz.erp.catalog.product.domain.port;

import com.dz.erp.catalog.product.domain.model.CatalogProduct;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Domain port for CatalogProduct persistence.
 * Implemented by CatalogProductRepositoryAdapter in infrastructure layer.
 */
public interface CatalogProductRepository {

    Optional<CatalogProduct> findBySkuCodeAndTenantId(String skuCode, String tenantId);

    Optional<CatalogProduct> findByIdAndTenantId(UUID id, String tenantId);

    List<CatalogProduct> findAllByStatusAndTenantId(PublicationStatus status, String tenantId);

    List<CatalogProduct> findAllByCategoryIdAndTenantId(UUID categoryId, String tenantId);

    List<CatalogProduct> findPublishedByChannelAndTenantId(ChannelType channel, String tenantId);

    /** Products whose scheduledAt <= cutoff and status = SCHEDULED */
    List<CatalogProduct> findScheduledBefore(LocalDateTime cutoff, String tenantId);

    /** Products whose autoUnpublishAt <= cutoff and status = PUBLISHED */
    List<CatalogProduct> findAutoUnpublishBefore(LocalDateTime cutoff, String tenantId);

    Page<CatalogProduct> search(CatalogSearchCriteria criteria, Pageable pageable);

    CatalogProduct save(CatalogProduct product);

    void deleteBySkuCodeAndTenantId(String skuCode, String tenantId);

    long countByCategoryIdAndTenantId(UUID categoryId, String tenantId);

    long countByCategoryIdAndStatusAndTenantId(UUID categoryId, PublicationStatus status, String tenantId);

    long countByStatusAndTenantId(PublicationStatus status, String tenantId);
}

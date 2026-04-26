package com.dz.erp.catalog.product.infrastructure.persistence;

import com.dz.erp.catalog.shared.domain.PublicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CatalogProductSpringDataRepository extends JpaRepository<CatalogProductJpaEntity, UUID>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<CatalogProductJpaEntity> {

    Optional<CatalogProductJpaEntity> findBySkuCodeAndTenantId(String skuCode, String tenantId);

    Optional<CatalogProductJpaEntity> findByIdAndTenantId(UUID id, String tenantId);

    List<CatalogProductJpaEntity> findByPublicationStatusAndTenantId(PublicationStatus status, String tenantId);

    List<CatalogProductJpaEntity> findByCategoryIdAndTenantId(UUID categoryId, String tenantId);

    @Query("SELECT p FROM CatalogProductJpaEntity p WHERE p.publicationStatus = 'SCHEDULED' AND p.scheduledAt <= :cutoff AND p.tenantId = :tenantId")
    List<CatalogProductJpaEntity> findScheduledBefore(LocalDateTime cutoff, String tenantId);

    @Query("SELECT p FROM CatalogProductJpaEntity p WHERE p.publicationStatus = 'PUBLISHED' AND p.autoUnpublishAt IS NOT NULL AND p.autoUnpublishAt <= :cutoff AND p.tenantId = :tenantId")
    List<CatalogProductJpaEntity> findAutoUnpublishBefore(LocalDateTime cutoff, String tenantId);

    long countByCategoryIdAndTenantId(UUID categoryId, String tenantId);

    long countByCategoryIdAndPublicationStatusAndTenantId(UUID categoryId, PublicationStatus status, String tenantId);

    long countByPublicationStatusAndTenantId(PublicationStatus status, String tenantId);

    @Query("SELECT p FROM CatalogProductJpaEntity p WHERE p.publicationStatus = 'PUBLISHED' AND p.channelWhatsapp = true AND p.tenantId = :tenantId")
    List<CatalogProductJpaEntity> findPublishedWhatsappByTenantId(String tenantId);

    @Query("SELECT p FROM CatalogProductJpaEntity p WHERE p.publicationStatus = 'PUBLISHED' AND p.channelWeb = true AND p.tenantId = :tenantId")
    List<CatalogProductJpaEntity> findPublishedWebByTenantId(String tenantId);

    @Query("SELECT p FROM CatalogProductJpaEntity p WHERE p.publicationStatus = 'PUBLISHED' AND p.channelMarketplace = true AND p.tenantId = :tenantId")
    List<CatalogProductJpaEntity> findPublishedMarketplaceByTenantId(String tenantId);

    Page<CatalogProductJpaEntity> findByTenantId(String tenantId, Pageable pageable);
}

package com.dz.erp.catalog.category.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategorySpringDataRepository extends JpaRepository<CategoryJpaEntity, UUID> {

    Optional<CategoryJpaEntity> findByCodeAndTenantId(String code, String tenantId);

    Optional<CategoryJpaEntity> findByIdAndTenantId(UUID id, String tenantId);

    List<CategoryJpaEntity> findByTenantIdOrderByPosition(String tenantId);

    List<CategoryJpaEntity> findByParentIdAndTenantId(UUID parentId, String tenantId);

    boolean existsByCodeAndTenantId(String code, String tenantId);

    @Modifying
    void deleteByCodeAndTenantId(String code, String tenantId);

    @Query("""
        SELECT COUNT(cp) FROM CatalogProductJpaEntity cp
        JOIN CategoryJpaEntity c ON cp.categoryId = c.id
        WHERE c.code = :code AND cp.tenantId = :tenantId
        """)
    long countProductsByCategoryCodeAndTenantId(String code, String tenantId);
}

package com.dz.erp.catalog.category.domain.port;

import com.dz.erp.catalog.category.domain.model.Category;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Domain port for Category persistence.
 * Implemented by CategoryRepositoryAdapter in infrastructure layer.
 */
public interface CategoryRepository {

    Optional<Category> findByCodeAndTenantId(String code, String tenantId);

    Optional<Category> findByIdAndTenantId(UUID id, String tenantId);

    List<Category> findAllByTenantId(String tenantId);

    List<Category> findByParentIdAndTenantId(UUID parentId, String tenantId);

    Category save(Category category);

    void deleteByCodeAndTenantId(String code, String tenantId);

    boolean existsByCodeAndTenantId(String code, String tenantId);

    long countProductsByCategoryCodeAndTenantId(String code, String tenantId);
}

package com.dz.erp.catalog.category.infrastructure.persistence;

import com.dz.erp.catalog.category.domain.model.Category;
import com.dz.erp.catalog.category.domain.port.CategoryRepository;
import com.dz.erp.catalog.category.infrastructure.mapper.CategoryPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CategoryRepositoryAdapter implements CategoryRepository {

    private final CategorySpringDataRepository jpa;
    private final CategoryPersistenceMapper mapper;

    @Override
    public Optional<Category> findByCodeAndTenantId(String code, String tenantId) {
        return jpa.findByCodeAndTenantId(code, tenantId).map(mapper::toDomain);
    }

    @Override
    public Optional<Category> findByIdAndTenantId(UUID id, String tenantId) {
        return jpa.findByIdAndTenantId(id, tenantId).map(mapper::toDomain);
    }

    @Override
    public List<Category> findAllByTenantId(String tenantId) {
        return jpa.findByTenantIdOrderByPosition(tenantId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Category> findByParentIdAndTenantId(UUID parentId, String tenantId) {
        return jpa.findByParentIdAndTenantId(parentId, tenantId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Category save(Category category) {
        return mapper.toDomain(jpa.save(mapper.toJpa(category)));
    }

    @Override
    public void deleteByCodeAndTenantId(String code, String tenantId) {
        jpa.deleteByCodeAndTenantId(code, tenantId);
    }

    @Override
    public boolean existsByCodeAndTenantId(String code, String tenantId) {
        return jpa.existsByCodeAndTenantId(code, tenantId);
    }

    @Override
    public long countProductsByCategoryCodeAndTenantId(String code, String tenantId) {
        return jpa.countProductsByCategoryCodeAndTenantId(code, tenantId);
    }
}

package com.dz.erp.catalog.category.infrastructure.mapper;

import com.dz.erp.catalog.category.domain.model.Category;
import com.dz.erp.catalog.category.infrastructure.persistence.CategoryJpaEntity;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Manual mapper (not MapStruct) because of JSONB channelConfig conversion.
 */
@Component
@RequiredArgsConstructor
public class CategoryPersistenceMapper {

    private final ObjectMapper json;
    private static final TypeReference<Map<String, Boolean>> MAP_TYPE = new TypeReference<>() {};

    @SneakyThrows
    public CategoryJpaEntity toJpa(Category d) {
        var e = new CategoryJpaEntity();
        e.setId(d.getId());
        e.setTenantId(d.getTenantId());
        e.setParentId(d.getParentId());
        e.setCode(d.getCode());
        e.setNameFr(d.getNameFr());
        e.setNameAr(d.getNameAr());
        e.setSlugFr(d.getSlugFr());
        e.setSlugAr(d.getSlugAr());
        e.setMetaTitleFr(d.getMetaTitleFr());
        e.setMetaTitleAr(d.getMetaTitleAr());
        e.setTvaCategoryCode(d.getTvaCategoryCode());
        e.setChannelConfigJson(d.getChannelConfig() != null ? json.writeValueAsString(d.getChannelConfig()) : null);
        e.setPosition(d.getPosition());
        e.setActive(d.isActive());
        e.setCreatedBy(d.getCreatedBy());
        e.setCreatedAt(d.getCreatedAt());
        e.setUpdatedAt(d.getUpdatedAt());
        return e;
    }

    @SneakyThrows
    public Category toDomain(CategoryJpaEntity e) {
        if (e == null) return null;
        Map<String, Boolean> config = e.getChannelConfigJson() != null
                ? json.readValue(e.getChannelConfigJson(), MAP_TYPE)
                : Map.of();
        return Category.reconstitute(
                e.getId(), e.getTenantId(), e.getParentId(), e.getCode(),
                e.getNameFr(), e.getNameAr(), e.getSlugFr(), e.getSlugAr(),
                e.getMetaTitleFr(), e.getMetaTitleAr(), e.getTvaCategoryCode(),
                config, e.getPosition(), e.isActive(),
                e.getCreatedAt(), e.getCreatedBy(), e.getUpdatedAt());
    }
}

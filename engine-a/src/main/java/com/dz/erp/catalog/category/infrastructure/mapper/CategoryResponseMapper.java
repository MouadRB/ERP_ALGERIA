package com.dz.erp.catalog.category.infrastructure.mapper;

import com.dz.erp.catalog.category.application.dto.CategoryResponse;
import com.dz.erp.catalog.category.domain.model.Category;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoryResponseMapper {

    public CategoryResponse toResponse(Category c, long publishedCount, long maskedCount,
                                        long draftCount, List<String> productPreview) {
        return new CategoryResponse(
                c.getId(), c.getTenantId(), c.getParentId(), c.getCode(),
                c.getNameFr(), c.getNameAr(), c.getSlugFr(), c.getSlugAr(),
                c.getMetaTitleFr(), c.getMetaTitleAr(), c.getTvaCategoryCode(),
                c.getChannelConfig(), c.getPosition(), c.isActive(),
                publishedCount, maskedCount, draftCount, productPreview,
                c.getCreatedBy(), c.getCreatedAt(), c.getUpdatedAt());
    }
}

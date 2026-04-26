package com.dz.erp.catalog.category.application;

import com.dz.erp.catalog.category.application.dto.*;
import com.dz.erp.catalog.category.domain.event.CatalogCategoryDomainEvent;
import com.dz.erp.catalog.category.domain.model.Category;
import com.dz.erp.catalog.category.domain.port.CategoryRepository;
import com.dz.erp.catalog.category.infrastructure.cache.CategoryCacheService;
import com.dz.erp.catalog.category.infrastructure.event.CategoryEventPublisher;
import com.dz.erp.catalog.category.infrastructure.mapper.CategoryResponseMapper;
import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepo;
    private final CatalogProductRepository productRepo;
    private final CategoryEventPublisher eventPublisher;
    private final CategoryResponseMapper responseMapper;
    private final CategoryCacheService cacheService;

    // ── Create ──
    @Transactional
    public CategoryResponse createCategory(CreateCategoryCommand cmd) {
        var tenantId = AuthContext.currentTenantId();
        var actorId = AuthContext.currentUserId();

        if (categoryRepo.existsByCodeAndTenantId(cmd.code(), tenantId))
            throw new BusinessException(ErrorCode.CATEGORY_CODE_EXISTS, cmd.code());

        UUID parentId = null;
        if (cmd.parentCode() != null && !cmd.parentCode().isBlank()) {
            var parent = categoryRepo.findByCodeAndTenantId(cmd.parentCode(), tenantId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_PARENT_NOT_FOUND, cmd.parentCode()));
            parentId = parent.getId();
        }

        var category = Category.create(tenantId, cmd.code(), cmd.nameFr(), cmd.nameAr(),
                parentId, cmd.metaTitleFr(), cmd.metaTitleAr(),
                cmd.tvaCategoryCode(), cmd.channelConfig(), cmd.position(), actorId);

        category = categoryRepo.save(category);

        eventPublisher.publish("CATEGORY_CREATED", category.getId().toString(),
                new CatalogCategoryDomainEvent.Created(category.getId().toString(), cmd.code(), tenantId, actorId));

        cacheService.evictTree(tenantId);

        log.info("Category created: {} ({})", category.getCode(), category.getNameFr());
        return toResponseWithStats(category);
    }

    // ── Update ──
    @Transactional
    public CategoryResponse updateCategory(String code, UpdateCategoryCommand cmd) {
        var tenantId = AuthContext.currentTenantId();
        var category = findOrThrow(code, tenantId);

        UUID parentId = category.getParentId();
        if (cmd.parentCode() != null) {
            if (cmd.parentCode().isBlank()) {
                parentId = null;
            } else {
                var parent = categoryRepo.findByCodeAndTenantId(cmd.parentCode(), tenantId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_PARENT_NOT_FOUND, cmd.parentCode()));
                parentId = parent.getId();
            }
        }

        boolean slugBefore = category.getSlugFr() != null ? true : false;
        String oldSlug = category.getSlugFr();

        category.update(cmd.nameFr(), cmd.nameAr(), cmd.metaTitleFr(), cmd.metaTitleAr(),
                cmd.tvaCategoryCode(), cmd.channelConfig(), cmd.position(), parentId);

        boolean slugChanged = !Objects.equals(oldSlug, category.getSlugFr());

        category = categoryRepo.save(category);

        eventPublisher.publish("CATEGORY_UPDATED", category.getId().toString(),
                new CatalogCategoryDomainEvent.Updated(category.getId().toString(), code, tenantId, slugChanged));

        if (slugChanged) {
            log.warn("Category {} slug changed — SEO impact", code);
        }

        cacheService.evictTree(tenantId);
        cacheService.evictCategory(code, tenantId);

        log.info("Category updated: {}", code);
        return toResponseWithStats(category);
    }

    // ── Delete ──
    @Transactional
    public void deleteCategory(String code) {
        var tenantId = AuthContext.currentTenantId();
        var category = findOrThrow(code, tenantId);

        long productCount = categoryRepo.countProductsByCategoryCodeAndTenantId(code, tenantId);
        if (productCount > 0)
            throw new BusinessException(ErrorCode.CATEGORY_HAS_PRODUCTS, code);

        eventPublisher.publish("CATEGORY_DELETED", category.getId().toString(),
                new CatalogCategoryDomainEvent.Deleted(category.getId().toString(), code, tenantId));

        categoryRepo.deleteByCodeAndTenantId(code, tenantId);

        cacheService.evictTree(tenantId);
        cacheService.evictCategory(code, tenantId);
        log.info("Category deleted: {}", code);
    }

    // ── Get tree (cached) ──
    @Transactional(readOnly = true)
    public List<CategoryTreeResponse> getCategoryTree() {
        var tenantId = AuthContext.currentTenantId();

        var cached = cacheService.getTree(tenantId);
        if (cached != null) return cached;

        var allCategories = categoryRepo.findAllByTenantId(tenantId);
        var tree = buildTree(allCategories, null, tenantId);

        cacheService.putTree(tenantId, tree);
        return tree;
    }

    // ── Get single category with stats ──
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryWithStats(String code) {
        var tenantId = AuthContext.currentTenantId();
        var category = findOrThrow(code, tenantId);
        return toResponseWithStats(category);
    }

    // ── Private helpers ──

    private List<CategoryTreeResponse> buildTree(List<Category> all, UUID parentId, String tenantId) {
        return all.stream()
                .filter(c -> Objects.equals(c.getParentId(), parentId))
                .sorted(Comparator.comparingInt(Category::getPosition))
                .map(c -> {
                    long count = productRepo.countByCategoryIdAndTenantId(c.getId(), tenantId);
                    return new CategoryTreeResponse(c.getId(), c.getCode(), c.getNameFr(), c.getNameAr(),
                            c.getPosition(), c.isActive(), count,
                            buildTree(all, c.getId(), tenantId));
                })
                .toList();
    }

    private CategoryResponse toResponseWithStats(Category c) {
        var tid = c.getTenantId();
        var catId = c.getId();
        long published = productRepo.countByCategoryIdAndStatusAndTenantId(catId, PublicationStatus.PUBLISHED, tid);
        long masked = productRepo.countByCategoryIdAndStatusAndTenantId(catId, PublicationStatus.MASKED_AUTO, tid)
                     + productRepo.countByCategoryIdAndStatusAndTenantId(catId, PublicationStatus.MASKED_MANUAL, tid);
        long draft = productRepo.countByCategoryIdAndStatusAndTenantId(catId, PublicationStatus.DRAFT, tid);

        var products = productRepo.findAllByCategoryIdAndTenantId(catId, tid);
        var preview = products.stream()
                .limit(5)
                .map(p -> p.getSkuCode())
                .collect(Collectors.toList());

        return responseMapper.toResponse(c, published, masked, draft, preview);
    }

    private Category findOrThrow(String code, String tenantId) {
        return categoryRepo.findByCodeAndTenantId(code, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND, code));
    }
}

package com.dz.erp.pim.product.application;

import com.dz.erp.pim.attribute.infrastructure.persistence.ProductAttributeSpringDataRepository;
import com.dz.erp.pim.logistics.domain.port.LogisticsRepository;
import com.dz.erp.pim.logistics.domain.port.WilayaRestrictionRepository;
import com.dz.erp.pim.media.infrastructure.persistence.ProductMediaSpringDataRepository;
import com.dz.erp.pim.pricing.infrastructure.persistence.PriceSpringDataRepository;
import com.dz.erp.pim.product.application.dto.*;
import com.dz.erp.pim.product.domain.event.ProductDomainEvent;
import com.dz.erp.pim.product.domain.model.Product;
import com.dz.erp.pim.product.domain.model.ProductOrigin;
import com.dz.erp.pim.product.domain.model.ProductStatus;
import com.dz.erp.pim.product.domain.model.ReturnPolicy;
import com.dz.erp.pim.product.domain.port.MdmClient;
import com.dz.erp.pim.product.domain.port.ProductEventPort;
import com.dz.erp.pim.product.domain.port.ProductRepository;
import com.dz.erp.pim.product.infrastructure.mapper.ProductResponseMapper;
import com.dz.erp.pim.seo.infrastructure.persistence.SeoSpringDataRepository;
import com.dz.erp.pim.variant.application.VariantService;
import com.dz.erp.pim.variant.domain.port.VariantAttributeRepository;
import com.dz.erp.pim.variant.domain.port.VariantRepository;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final ProductEventPort eventPort;
    private final ProductResponseMapper mapper;
    private final MdmClient mdmClient;
    private final VariantService variantService;
    private final VariantRepository variantRepo;
    private final VariantAttributeRepository variantAttributeRepo;
    private final ProductAttributeSpringDataRepository attributeRepo;
    private final PriceSpringDataRepository pricingRepo;
    private final ProductMediaSpringDataRepository mediaRepo;
    private final LogisticsRepository logisticsRepo;
    private final WilayaRestrictionRepository restrictionRepo;
    private final SeoSpringDataRepository seoRepo;

    // ── 12.1 Standard CRUD ──

    @Transactional
    public ProductResponse create(CreateProductCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();

        // Validate SKU in MDM (separate JVM — REST call)
        var skuInfo = mdmClient.validateSku(cmd.skuCode())
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, cmd.skuCode()));
        if ("DISCONTINUED".equals(skuInfo.status()))
            throw new BusinessException(ErrorCode.PRODUCT_SKU_NOT_ACTIVE, cmd.skuCode());
        // SKU DRAFT allowed — product created but activation blocked until SKU becomes ACTIVE

        if (repo.existsBySkuCode(cmd.skuCode().trim().toUpperCase(), tid))
            throw new BusinessException(ErrorCode.PRODUCT_DUPLICATE_SKU, cmd.skuCode());

        // Validate Supplier if provided
        if (cmd.supplierCode() != null) {
            var sup = mdmClient.validateSupplier(cmd.supplierCode())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_SUPPLIER_NOT_FOUND, cmd.supplierCode()));
            if (!"ACTIVE".equals(sup.status()))
                throw new BusinessException(ErrorCode.PRODUCT_SUPPLIER_NOT_ACTIVE, cmd.supplierCode());
        }

        var product = Product.create(tid, cmd.skuCode(), skuInfo.status(),
                cmd.supplierCode(), cmd.supplierRef(), cmd.categoryCode(),
                cmd.nameFr(), cmd.nameAr(), cmd.descriptionFr(), cmd.descriptionAr(),
                cmd.brand(), cmd.model(),
                cmd.origin() != null ? ProductOrigin.valueOf(cmd.origin()) : null,
                cmd.barcode(),
                cmd.returnPolicy() != null ? ReturnPolicy.valueOf(cmd.returnPolicy()) : null,
                uid);
        product = repo.save(product);

        eventPort.publish("PRODUCT_CREATED", product.getProductId(),
                new ProductDomainEvent.Created(UUID.randomUUID().toString(), "PRODUCT_CREATED", 1,
                        tid, "Product", product.getProductId(), Instant.now(),
                        product.getSkuCode(), product.getNameFr(),
                        product.getCategoryCode(), uid));

        log.info("Product created: {} (SKU: {}, MDM SKU status: {})", product.getProductId(), product.getSkuCode(), skuInfo.status());
        return mapper.toResponse(product);
    }

    @Transactional
    public ProductResponse update(String productId, UpdateProductCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var product = findOrThrow(productId, tid);
        product.update(cmd.nameFr(), cmd.nameAr(), cmd.descriptionFr(), cmd.descriptionAr(),
                cmd.brand(), cmd.model(),
                cmd.origin() != null ? ProductOrigin.valueOf(cmd.origin()) : null,
                cmd.barcode(), cmd.supplierRef(),
                cmd.returnPolicy() != null ? ReturnPolicy.valueOf(cmd.returnPolicy()) : null, uid);
        product = repo.save(product);
        eventPort.publish("PRODUCT_UPDATED", product.getProductId(),
                new ProductDomainEvent.Updated(UUID.randomUUID().toString(), "PRODUCT_UPDATED", 1,
                        tid, "Product", product.getProductId(), Instant.now(), product.getProductId(),
                        product.getSkuCode(), null, null, uid));
        return mapper.toResponse(product);
    }

    @Transactional
    public ProductResponse activate(String productId) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var product = findOrThrow(productId, tid);

        // Re-validate SKU in MDM
        var skuInfo = mdmClient.validateSku(product.getSkuCode())
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, product.getSkuCode()));

        if (!"ACTIVE".equals(skuInfo.status()))
            throw new BusinessException(ErrorCode.PRODUCT_SKU_PENDING_MDM_ACTIVATION, product.getSkuCode());

        product.updateSkuStatus(skuInfo.status());
        product.activate(uid);

        var savedProduct = repo.save(product);

        eventPort.publish(
                "PRODUCT_ACTIVATED",
                savedProduct.getProductId(),
                new ProductDomainEvent.Activated(
                        UUID.randomUUID().toString(),
                        "PRODUCT_ACTIVATED",
                        1,
                        tid,
                        "Product",
                        savedProduct.getProductId(),
                        Instant.now(),
                        savedProduct.getSkuCode(),
                        savedProduct.getNameFr(),
                        savedProduct.getCategoryCode(),
                        uid
                )
        );

        log.info("Product activated: {} (SKU: {})", savedProduct.getProductId(), savedProduct.getSkuCode());

        return mapper.toResponse(savedProduct);
    }

    @Transactional
    public ProductResponse deactivate(String productId) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var product = findOrThrow(productId, tid);
        product.deactivate(uid);
        product = repo.save(product);
        eventPort.publish("PRODUCT_DEACTIVATED", product.getProductId(),
                new ProductDomainEvent.Deactivated(UUID.randomUUID().toString(), "PRODUCT_DEACTIVATED", 1,
                        tid, "Product", product.getProductId(), Instant.now(),
                        product.getSkuCode(), product.getNameFr(), uid));
        return mapper.toResponse(product);
    }

    @Transactional
    public ProductResponse discontinue(String productId) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var product = findOrThrow(productId, tid);
        product.discontinue(uid);
        product = repo.save(product);
        eventPort.publish("PRODUCT_DISCONTINUED", product.getProductId(),
                new ProductDomainEvent.Discontinued(UUID.randomUUID().toString(), "PRODUCT_DISCONTINUED", 1,
                        tid, "Product", product.getProductId(), Instant.now(),
                        product.getSkuCode(), product.getNameFr(), uid));
        log.info("Product discontinued: {}", product.getProductId());
        return mapper.toResponse(product);
    }

    // ── 12.2 OCR Import ──

    @Transactional
    public ProductResponse createFromOcr(CreateFromOcrCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        String skuStatus = null;
        if (cmd.skuCode() != null) {
            var skuInfo = mdmClient.validateSku(cmd.skuCode())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, cmd.skuCode()));
            if ("DISCONTINUED".equals(skuInfo.status()))
                throw new BusinessException(ErrorCode.PRODUCT_SKU_NOT_ACTIVE, cmd.skuCode());
            if (repo.existsBySkuCode(cmd.skuCode().trim().toUpperCase(), tid))
                throw new BusinessException(ErrorCode.PRODUCT_DUPLICATE_SKU, cmd.skuCode());
        }
        var product = Product.createFromOcr(tid, cmd.skuCode(), skuStatus,
                cmd.supplierCode(), cmd.categoryCode(), cmd.nameFr(), uid);
        product = repo.save(product);
        log.info("OCR product created: {} (SKU: {})", product.getProductId(), product.getSkuCode());
        return mapper.toResponse(product);
    }


    // ── 12.3 Performance Updates (internal APIs) ──

    @Transactional
    public ProductResponse updateSalesStats(String skuCode, UpdateSalesStatsCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var product = repo.findBySkuCode(skuCode, tid).orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, skuCode));

        product.updateSalesStats(cmd.ordersLast30Days(), cmd.salesLast30Days(), cmd.qualityScore());
        return mapper.toResponse(repo.save(product));
    }

    @Transactional
    public void updateReturnRate(String skuCode, UpdateReturnRateCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var product = repo.findBySkuCode(skuCode, tid).orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, skuCode));


        if (product.getStatus().equals(ProductStatus.DISCONTINUED)) {
            throw new BusinessException(ErrorCode.PRODUCT_SKU_IS_DISCONTINUED, product.getSkuCode());
        }

        var wasFlagged = product.isFlagged();
        product.updateReturnRate(cmd.returnRate());
        repo.save(product);

        // Fire Flagged event if newly crossed 30% threshold
        if (!wasFlagged && product.isFlagged()) {
            eventPort.publish("PRODUCT_FLAGGED", product.getProductId(),
                    new ProductDomainEvent.Flagged(UUID.randomUUID().toString(), "PRODUCT_FLAGGED", 1,
                            product.getTenantId(), "Product", product.getProductId(), Instant.now(),
                            product.getSkuCode(), product.getNameFr(), product.getReturnRate()));
            log.warn("Product flagged (return rate {}%): {} (SKU: {})", product.getReturnRate(), product.getProductId(), product.getSkuCode());
        }
    }

    // ── Stock recalculation (called by event listener) ──

    @Transactional
    public void recalculateTotalStock(String skuCode, String tenantId) {
        var product = repo.findBySkuCode(skuCode, tenantId).orElse(null);
        if (product == null) return;
        var variants = variantService.listByProductInternal(product.getProductId(), tenantId);
        int total = variants.stream().mapToInt(v -> v.stockQuantity()).sum();
        product.updateTotalStock(total);
        repo.save(product);
    }

    // ── 12.4 Product with Variants ──

    @Transactional(readOnly = true)
    public ProductWithVariantsResponse getWithVariants(String productId) {
        var tid = AuthContext.currentTenantId();
        var product = findOrThrow(productId, tid);
        var variants = variantService.listByProduct(productId);
        int totalStock = variants.stream().mapToInt(v -> v.stockQuantity()).sum();
        int activeCount = (int) variants.stream().filter(v -> "ACTIVE".equals(v.status())).count();
        return new ProductWithVariantsResponse(mapper.toResponse(product), variants, totalStock, activeCount);
    }

    // ── 12.5 Stats & Search ──

    @Transactional(readOnly = true)
    public ProductResponse getById(String productId) {
        return mapper.toResponse(findOrThrow(productId, AuthContext.currentTenantId()));
    }

    @Transactional(readOnly = true)
    public ProductResponse getBySku(String skuCode) {
        return mapper.toResponse(repo.findBySkuCode(skuCode, AuthContext.currentTenantId()).orElse(null));
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(ProductSearchQuery q) {
        return repo.search(q.search(), q.categoryCode(), q.status(), q.supplierCode(),
                AuthContext.currentTenantId(),
                PageRequest.of(q.page(), q.size(), Sort.by("createdAt").descending())).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductStatsResponse getStats() {
        var tid = AuthContext.currentTenantId();
        return new ProductStatsResponse(
                repo.countByStatus(ProductStatus.ACTIVE, tid),
                repo.countByStatus(ProductStatus.DRAFT, tid),
                repo.countByReturnRateGreaterThan(new BigDecimal("30"), tid),
                repo.countByStatus(ProductStatus.DISCONTINUED, tid),
                repo.countByStatus(ProductStatus.OCR_IMPORT, tid));
    }
    @Transactional
    public void deleteProduct(String productId) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var product = findOrThrow(productId, tid);

        // 1. Delete variant attributes for each variant
        var variants = variantRepo.findByProductId(productId, tid);
        for (var variant : variants) {
            variantAttributeRepo.deleteByProductIdAndTenantId(variant.getVariantId(), tid);
        }

        // 2. Delete variants
        variantRepo.deleteByProductIdAndTenantId(productId, tid);

        // 3. Delete product attributes
        attributeRepo.deleteAllByProductId(productId, tid);

        // 4. Delete pricing + price history
        pricingRepo.deleteAllByProductId(productId, tid);

        // 5. Delete media
        mediaRepo.deleteByProductIdAndTenantId(productId, tid);

        // 6. Delete logistics + wilaya restrictions
        restrictionRepo.deleteAllByProductId(productId, tid);
        logisticsRepo.deleteAllByProductId(productId, tid);

        // 7. Delete SEO
        seoRepo.deleteAllByProductId(productId, tid);


        // 9. Delete product itself
        repo.deleteByProductIdAndTenantId(productId, tid);

        // 10. Event
        log.info("Product deleted with all relations: {} (SKU: {}) by {}", productId, product.getSkuCode(), uid);
    }

    private Product findOrThrow(String productId, String tenantId) {
        return repo.findById(productId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, productId));
    }
}

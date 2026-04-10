package com.dz.erp.pim.product.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
@EqualsAndHashCode(of = {"productId", "tenantId"})
public class Product {
    private final String productId;
    private final String tenantId;

    // MDM references
    private String skuCode;
    private String skuStatus;           // snapshot: "DRAFT","ACTIVE","DISCONTINUED"
    private String supplierCode;
    private String supplierRef;
    private String categoryCode;

    // Bilingual content
    private String nameFr;
    private String nameAr;
    private String descriptionFr;
    private String descriptionAr;
    private String brand;
    private String model;
    private ProductOrigin origin;

    // Classification
    private String barcode;
    private int variantCount;
    private int totalStock;             // sum of all variant stockQuantity

    // Status
    private ProductStatus status;
    private ReturnPolicy returnPolicy;

    // Performance
    private BigDecimal returnRate;
    private int ordersLast30Days;
    private BigDecimal salesLast30Days;
    private BigDecimal qualityScore;

    // Audit
    private final String createdBy;
    private final Instant createdAt;
    private String updatedBy;
    private Instant updatedAt;
    private long version;

    // ── Factory: standard create ──
    public static Product create(String tenantId, String skuCode, String skuStatus,
                                 String supplierCode, String supplierRef, String categoryCode,
                                 String nameFr, String nameAr, String descriptionFr, String descriptionAr,
                                 String brand, String model, ProductOrigin origin, String barcode,
                                 ReturnPolicy returnPolicy, String createdBy) {
        Objects.requireNonNull(skuCode, "SKU code required");
        Objects.requireNonNull(nameFr, "French name required");
        Objects.requireNonNull(nameAr, "Arabic name required");
        return new Product(UUID.randomUUID().toString(), tenantId,
                skuCode.trim().toUpperCase(), skuStatus, supplierCode, supplierRef, categoryCode,
                nameFr, nameAr, descriptionFr, descriptionAr, brand, model,
                origin != null ? origin : ProductOrigin.IMPORTED, barcode, 0, 0,
                ProductStatus.DRAFT, returnPolicy != null ? returnPolicy : ReturnPolicy.RETURNABLE_7D,
                BigDecimal.ZERO, 0, BigDecimal.ZERO, BigDecimal.ZERO,
                Objects.requireNonNull(createdBy), Instant.now(), null, null, 0);
    }

    // ── Factory: OCR import ──
    public static Product createFromOcr(String tenantId, String skuCode, String skuStatus,
                                        String supplierCode, String categoryCode,
                                        String nameFr, String createdBy) {
        return new Product(UUID.randomUUID().toString(), tenantId,
                skuCode != null ? skuCode.trim().toUpperCase() : null, skuStatus,
                supplierCode, null, categoryCode,
                nameFr, null, null, null, null, null, ProductOrigin.IMPORTED, null, 0, 0,
                ProductStatus.OCR_IMPORT, ReturnPolicy.RETURNABLE_7D,
                BigDecimal.ZERO, 0, BigDecimal.ZERO, BigDecimal.ZERO,
                createdBy, Instant.now(), null, null, 0);
    }

    // ── Factory: reconstitute from DB ──
    public static Product reconstitute(String productId, String tenantId, String skuCode, String skuStatus,
                                       String supplierCode, String supplierRef, String categoryCode,
                                       String nameFr, String nameAr, String descriptionFr, String descriptionAr,
                                       String brand, String model, ProductOrigin origin, String barcode,
                                       int variantCount, int totalStock,
                                       ProductStatus status, ReturnPolicy returnPolicy,
                                       BigDecimal returnRate, int ordersLast30Days,
                                       BigDecimal salesLast30Days, BigDecimal qualityScore,
                                       String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {
        return new Product(productId, tenantId, skuCode, skuStatus, supplierCode, supplierRef, categoryCode,
                nameFr, nameAr, descriptionFr, descriptionAr, brand, model, origin, barcode,
                variantCount, totalStock, status, returnPolicy, returnRate, ordersLast30Days,
                salesLast30Days, qualityScore, createdBy, createdAt, updatedBy, updatedAt, version);
    }

    private Product(String productId, String tenantId, String skuCode, String skuStatus,
                    String supplierCode, String supplierRef, String categoryCode,
                    String nameFr, String nameAr, String descriptionFr, String descriptionAr,
                    String brand, String model, ProductOrigin origin, String barcode,
                    int variantCount, int totalStock, ProductStatus status, ReturnPolicy returnPolicy,
                    BigDecimal returnRate, int ordersLast30Days, BigDecimal salesLast30Days,
                    BigDecimal qualityScore, String createdBy, Instant createdAt,
                    String updatedBy, Instant updatedAt, long version) {
        this.productId = productId;
        this.tenantId = tenantId;
        this.skuCode = skuCode;
        this.skuStatus = skuStatus;
        this.supplierCode = supplierCode;
        this.supplierRef = supplierRef;
        this.categoryCode = categoryCode;
        this.nameFr = nameFr;
        this.nameAr = nameAr;
        this.descriptionFr = descriptionFr;
        this.descriptionAr = descriptionAr;
        this.brand = brand;
        this.model = model;
        this.origin = origin;
        this.barcode = barcode;
        this.variantCount = variantCount;
        this.totalStock = totalStock;
        this.status = status;
        this.returnPolicy = returnPolicy;
        this.returnRate = returnRate;
        this.ordersLast30Days = ordersLast30Days;
        this.salesLast30Days = salesLast30Days;
        this.qualityScore = qualityScore;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    // ── Lifecycle: DRAFT → ACTIVE (SKU validated in service layer, not here) ──
    public void activate(String activatorId) {
        if (status != ProductStatus.DRAFT && status != ProductStatus.OCR_IMPORT)
            throw new BusinessException(ErrorCode.PRODUCT_INVALID_TRANSITION, status, ProductStatus.ACTIVE);

        if (createdBy.equals(activatorId))
            throw new BusinessException(ErrorCode.PRODUCT_SOD_VIOLATION);

        if (nameFr == null || nameAr == null)
            throw new BusinessException(ErrorCode.PRODUCT_NOT_EDITABLE);

        this.status = ProductStatus.ACTIVE;
        touch(activatorId);
    }


    public void deactivate(String actorId) {
        if (status != ProductStatus.ACTIVE)
            throw new BusinessException(ErrorCode.PRODUCT_INVALID_TRANSITION, status, ProductStatus.DRAFT);
        this.status = ProductStatus.DRAFT;
        touch(actorId);
    }

    public void discontinue(String actorId) {
        if (status != ProductStatus.ACTIVE && status != ProductStatus.DRAFT)
            throw new BusinessException(ErrorCode.PRODUCT_INVALID_TRANSITION, status, ProductStatus.DISCONTINUED);
        this.status = ProductStatus.DISCONTINUED;
        touch(actorId);
    }

    // ── Content update (DRAFT + OCR_IMPORT only) ──
    public void update(String nameFr, String nameAr, String descriptionFr, String descriptionAr,
                       String brand, String model, ProductOrigin origin, String barcode,
                       String supplierRef, ReturnPolicy returnPolicy, String actorId) {
        if (!isEditable()) throw new BusinessException(ErrorCode.PRODUCT_NOT_EDITABLE);
        if (nameFr != null) this.nameFr = nameFr;
        if (nameAr != null) this.nameAr = nameAr;
        if (descriptionFr != null) this.descriptionFr = descriptionFr;
        if (descriptionAr != null) this.descriptionAr = descriptionAr;
        if (brand != null) this.brand = brand;
        if (model != null) this.model = model;
        if (origin != null) this.origin = origin;
        if (barcode != null) this.barcode = barcode;
        if (supplierRef != null) this.supplierRef = supplierRef;
        if (returnPolicy != null) this.returnPolicy = returnPolicy;
        touch(actorId);
    }

    // ── Performance (separate methods, different cadences) ──
    public void updateSalesStats(int ordersLast30Days, BigDecimal salesLast30Days, BigDecimal qualityScore) {
        if (salesLast30Days != null) this.ordersLast30Days = ordersLast30Days;
        if (salesLast30Days != null) this.salesLast30Days = salesLast30Days;
        if (qualityScore != null) this.qualityScore = qualityScore;
    }

    public void updateReturnRate(BigDecimal returnRate) {
        if (returnRate != null) this.returnRate = returnRate;
    }

    // ── Stock (from Inventory events) ──
    public void updateTotalStock(int totalStock) {
        this.totalStock = totalStock;
    }

    public void updateSkuStatus(String skuStatus) {
        this.skuStatus = skuStatus;
    }

    public void incrementVariantCount() {
        this.variantCount++;
    }

    public void decrementVariantCount() {
        if (variantCount > 0) this.variantCount--;
    }

    // ── Helpers ──
    public boolean isFlagged() {
        return returnRate != null && returnRate.compareTo(new BigDecimal("30")) >= 0;
    }

    public boolean isEditable() {
        return status == ProductStatus.DRAFT || status == ProductStatus.OCR_IMPORT;
    }

    public boolean isSkuActivationBlocked() {
        return !"ACTIVE".equals(skuStatus);
    }

    private void touch(String actorId) {
        this.updatedBy = actorId;
        this.updatedAt = Instant.now();
    }
}

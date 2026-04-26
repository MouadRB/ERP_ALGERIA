package com.dz.erp.catalog.search.shared.port.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Snapshot DTOs defined by Catalog for data received from PIM via REST.
 * Catalog never imports PIM's response classes — these are Catalog's own view
 * of what it needs from PIM.
 */
public final class PimSnapshots {
    private PimSnapshots() {}

    public record PimProductSnapshot(
            String productId,
            String skuCode,
            String nameFr,
            String nameAr,
            String descriptionFr,
            String descriptionAr,
            String brand,
            String categoryCode,
            String status,          // "ACTIVE", "DRAFT", "DISCONTINUED", "OCR_IMPORT"
            int totalStock,
            BigDecimal returnRate
    ) {}

    public record PimVariantSnapshot(
            String variantId,
            String skuCode,
            String label,           // "T.39", "T.40"
            int stockQuantity,
            BigDecimal priceOverride
    ) {}

    public record PimPricingSnapshot(
            BigDecimal priceTtc,
            BigDecimal priceHt,
            BigDecimal tvaRate,
            BigDecimal costFifo,
            BigDecimal marginPercent
    ) {
        /** Convenience for WhatsApp rule evaluation. */
        public int priceTtcAsInt() {
            return priceTtc != null ? priceTtc.intValue() : 0;
        }
    }

    public record PimAttributeSnapshot(
            String key,
            String valueFr,
            String valueAr
    ) {}

    public record PimSeoSnapshot(
            String slugFr,
            String slugAr,
            String metaTitleFr,
            String metaTitleAr,
            List<String> keywords
    ) {}

    public record PimMediaSnapshot(
            String fileUrl,
            String mediaType,       // "PRINCIPAL" or "GALLERY"
            int position
    ) {}
}

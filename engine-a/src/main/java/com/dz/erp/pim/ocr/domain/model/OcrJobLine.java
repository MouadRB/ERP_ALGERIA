package com.dz.erp.pim.ocr.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class OcrJobLine {
    private final String lineId;
    private final String jobId;
    private final int lineIndex;

    private String skuCode;
    private String nameFr;
    private String nameAr;
    private String supplierCode;
    private String categoryCode;
    private Integer qty;
    private BigDecimal salePrice;
    private BigDecimal costPrice;

    private OcrConfidence confidence;

    private boolean accepted;
    private String productId;

    public static OcrJobLine extract(String jobId, int lineIndex,
                                     String skuCode, String nameFr, String nameAr,
                                     String supplierCode, String categoryCode,
                                     Integer qty, BigDecimal salePrice, BigDecimal costPrice,
                                     OcrConfidence confidence) {
        return new OcrJobLine(UUID.randomUUID().toString(), jobId, lineIndex,
                skuCode, nameFr, nameAr, supplierCode, categoryCode,
                qty, salePrice, costPrice,
                confidence != null ? confidence : OcrConfidence.empty(),
                false, null);
    }

    public void applyUserEdits(String nameFr, String nameAr, String supplierCode, String categoryCode,
                               Integer qty, BigDecimal salePrice, BigDecimal costPrice) {
        if (nameFr != null) this.nameFr = nameFr;
        if (nameAr != null) this.nameAr = nameAr;
        if (supplierCode != null) this.supplierCode = supplierCode;
        if (categoryCode != null) this.categoryCode = categoryCode;
        if (qty != null) this.qty = qty;
        if (salePrice != null) this.salePrice = salePrice;
        if (costPrice != null) this.costPrice = costPrice;
    }

    public void markAccepted(String productId) {
        this.accepted = true;
        this.productId = productId;
    }
}

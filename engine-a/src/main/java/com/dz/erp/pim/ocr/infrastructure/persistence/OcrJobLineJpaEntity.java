package com.dz.erp.pim.ocr.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "ocr_job_lines", schema = "pim_schema",
        indexes = @Index(name = "idx_ocr_lines_job", columnList = "jobId"))
@Getter
@Setter
@NoArgsConstructor
public class OcrJobLineJpaEntity {
    @Id
    @Column(length = 36)
    private String lineId;
    @Column(nullable = false, length = 36)
    private String jobId;
    @Column(nullable = false)
    private int lineIndex;

    @Column(length = 50)
    private String skuCode;
    @Column(length = 200)
    private String nameFr;
    @Column(length = 200)
    private String nameAr;
    @Column(length = 50)
    private String supplierCode;
    @Column(length = 50)
    private String categoryCode;
    private Integer qty;
    @Column(precision = 19, scale = 4)
    private BigDecimal salePrice;
    @Column(precision = 19, scale = 4)
    private BigDecimal costPrice;

    private int confidenceOverall;
    private int confidenceNameFr;
    private int confidencePrice;
    private int confidenceCost;
    private int confidenceCategory;

    private boolean accepted;
    @Column(length = 36)
    private String productId;
}

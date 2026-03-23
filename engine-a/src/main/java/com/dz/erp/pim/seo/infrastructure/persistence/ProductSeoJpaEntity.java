package com.dz.erp.pim.seo.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "product_seo", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class ProductSeoJpaEntity {
    @Id
    @Column(length = 36)
    private String productId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(length = 300)
    private String slugFr;
    @Column(length = 300)
    private String slugAr;
    @Column(length = 60)
    private String metaTitleFr;
    @Column(length = 60)
    private String metaTitleAr;
    @Column(columnDefinition = "TEXT")
    private String metaDescriptionFr;
    @Column(columnDefinition = "TEXT")
    private String metaDescriptionAr;
    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> keywords;
    @Version
    private long version;
}

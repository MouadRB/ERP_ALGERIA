package com.dz.erp.pim.variant.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "variant_attributes", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class VariantAttributeJpaEntity {
    @Id
    @Column(length = 36)
    private String attributeId;
    @Column(nullable = false, length = 36)
    private String variantId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 100)
    private String key;
    @Column(nullable = false, length = 500)
    private String valueFr;
    @Column(length = 500)
    private String valueAr;
    @Column(length = 20)
    private String unit;
    private int sortOrder;
}

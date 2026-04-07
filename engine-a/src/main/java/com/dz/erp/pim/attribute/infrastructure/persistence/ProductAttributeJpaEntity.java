package com.dz.erp.pim.attribute.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_attributes", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class ProductAttributeJpaEntity {
    @Id
    @Column(length = 36)
    private String attributeId;
    @Column(nullable = false, length = 36)
    private String productId;
    @Column(nullable = false, length = 100)
    private String key;
    @Column(nullable = false, length = 500)
    private String valueFr;
    @Column(length = 500)
    private String valueAr;
    @Column(length = 20)
    private String unit;

}

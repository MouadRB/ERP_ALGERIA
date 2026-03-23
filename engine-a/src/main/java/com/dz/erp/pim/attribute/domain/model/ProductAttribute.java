package com.dz.erp.pim.attribute.domain.model;

import lombok.Getter;

import java.util.UUID;

@Getter
public class ProductAttribute {
    private final String attributeId;
    private final String productId;
    private String key;
    private String valueFr;
    private String valueAr;
    private String unit;


    public ProductAttribute(String productId, String key, String valueFr, String valueAr, String unit) {
        this.attributeId = UUID.randomUUID().toString();
        this.productId = productId;
        this.key = key;
        this.valueFr = valueFr;
        this.valueAr = valueAr;
        this.unit = unit;

    }


}

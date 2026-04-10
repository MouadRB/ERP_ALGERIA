package com.dz.erp.pim.variant.domain.model;

import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.util.Objects;
import java.util.UUID;

@Getter
@EqualsAndHashCode(of = {"attributeId"})
public class VariantAttribute {

    private final String attributeId;
    private final String variantId;
    private final String tenantId;
    private String key;
    private String valueFr;
    private String valueAr;
    private String unit;
    private int sortOrder;

    // ── Factory: create new ──
    public static VariantAttribute create(String variantId, String tenantId,
                                          String key, String valueFr, String valueAr,
                                          String unit, int sortOrder) {
        Objects.requireNonNull(variantId, "variantId required");
        Objects.requireNonNull(key, "attribute key required");
        Objects.requireNonNull(valueFr, "valueFr required");
        return new VariantAttribute(UUID.randomUUID().toString(), variantId, tenantId,
                key, valueFr, valueAr, unit, sortOrder);
    }

    // ── Factory: reconstitute from DB ──
    public static VariantAttribute reconstitute(String attributeId, String variantId, String tenantId,
                                                String key, String valueFr, String valueAr,
                                                String unit, int sortOrder) {
        return new VariantAttribute(attributeId, variantId, tenantId,
                key, valueFr, valueAr, unit, sortOrder);
    }

    private VariantAttribute(String attributeId, String variantId, String tenantId,
                             String key, String valueFr, String valueAr,
                             String unit, int sortOrder) {
        this.attributeId = attributeId;
        this.variantId = variantId;
        this.tenantId = tenantId;
        this.key = key;
        this.valueFr = valueFr;
        this.valueAr = valueAr;
        this.unit = unit;
        this.sortOrder = sortOrder;
    }

    public void update(String key, String valueFr, String valueAr, String unit, Integer sortOrder) {
        if (key != null) this.key = key;
        if (valueFr != null) this.valueFr = valueFr;
        if (valueAr != null) this.valueAr = valueAr;
        if (unit != null) this.unit = unit;
        if (sortOrder != null) this.sortOrder = sortOrder;
    }
}

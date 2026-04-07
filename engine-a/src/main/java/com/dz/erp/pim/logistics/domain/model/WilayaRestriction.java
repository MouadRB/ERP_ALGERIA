package com.dz.erp.pim.logistics.domain.model;

import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
@EqualsAndHashCode(of = {"restrictionId"})
public class WilayaRestriction {

    private final String restrictionId;
    private final String productId;
    private final String tenantId;
    private final String wilayaCode;
    private String reason;
    private final Instant restrictedAt;
    private final String restrictedBy;

    // ── Factory: create new restriction ──
    public static WilayaRestriction create(String productId, String tenantId,
                                           String wilayaCode, String reason, String restrictedBy) {
        Objects.requireNonNull(productId, "productId required");
        Objects.requireNonNull(wilayaCode, "wilayaCode required");
        Objects.requireNonNull(restrictedBy, "restrictedBy required");
        return new WilayaRestriction(UUID.randomUUID().toString(), productId, tenantId,
                wilayaCode, reason, Instant.now(), restrictedBy);
    }

    // ── Factory: reconstitute from DB ──
    public static WilayaRestriction reconstitute(String restrictionId, String productId, String tenantId,
                                                 String wilayaCode, String reason,
                                                 Instant restrictedAt, String restrictedBy) {
        return new WilayaRestriction(restrictionId, productId, tenantId,
                wilayaCode, reason, restrictedAt, restrictedBy);
    }

    private WilayaRestriction(String restrictionId, String productId, String tenantId,
                              String wilayaCode, String reason,
                              Instant restrictedAt, String restrictedBy) {
        this.restrictionId = restrictionId;
        this.productId = productId;
        this.tenantId = tenantId;
        this.wilayaCode = wilayaCode;
        this.reason = reason;
        this.restrictedAt = restrictedAt;
        this.restrictedBy = restrictedBy;
    }
}

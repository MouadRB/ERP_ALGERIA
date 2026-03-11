package com.dz.erp.mdm.wilaya.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.time.Instant;
import java.util.Objects;

@Getter
@EqualsAndHashCode(of = {"wilayaCode", "tenantId"})
public class WilayaConfig {
    private final String wilayaCode;
    private final String tenantId;
    private String name;
    private String nameAr;
    private String zone;
    private int deliveryCostDzd;
    private String estimatedDays;
    private boolean deliverable;
    private String notes;
    private WilayaStatus status;
    private final String createdBy;
    private final Instant createdAt;
    private String updatedBy;
    private Instant updatedAt;
    private long version;

    public static WilayaConfig create(String wilayaCode, String tenantId, String name, String nameAr,
                                      String zone, int deliveryCostDzd, String estimatedDays, boolean deliverable,
                                      String notes, String createdBy) {
        Objects.requireNonNull(wilayaCode);
        Objects.requireNonNull(name);
        return new WilayaConfig(wilayaCode.trim(), tenantId, name, nameAr, zone,
                deliveryCostDzd, estimatedDays, deliverable, notes, WilayaStatus.DRAFT,
                Objects.requireNonNull(createdBy), Instant.now(), null, null, 0);
    }

    public static WilayaConfig reconstitute(String wilayaCode, String tenantId, String name, String nameAr,
                                            String zone, int deliveryCostDzd, String estimatedDays, boolean deliverable,
                                            String notes, WilayaStatus status, String createdBy, Instant createdAt,
                                            String updatedBy, Instant updatedAt, long version) {
        return new WilayaConfig(wilayaCode, tenantId, name, nameAr, zone, deliveryCostDzd,
                estimatedDays, deliverable, notes, status, createdBy, createdAt, updatedBy, updatedAt, version);
    }

    private WilayaConfig(String wilayaCode, String tenantId, String name, String nameAr,
                         String zone, int deliveryCostDzd, String estimatedDays, boolean deliverable,
                         String notes, WilayaStatus status, String createdBy, Instant createdAt,
                         String updatedBy, Instant updatedAt, long version) {
        this.wilayaCode = wilayaCode;
        this.tenantId = tenantId;
        this.name = name;
        this.nameAr = nameAr;
        this.zone = zone;
        this.deliveryCostDzd = deliveryCostDzd;
        this.estimatedDays = estimatedDays;
        this.deliverable = deliverable;
        this.notes = notes;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    public void activate(String activatorId) {
        if (status != WilayaStatus.DRAFT)
            throw new BusinessException(ErrorCode.WILAYA_INVALID_TRANSITION, status, WilayaStatus.ACTIVE);
        if (createdBy.equals(activatorId)) throw new BusinessException(ErrorCode.WILAYA_SOD_VIOLATION);
        this.status = WilayaStatus.ACTIVE;
        touch(activatorId);
    }

    public void deactivate(String actorId) {
        if (status != WilayaStatus.ACTIVE)
            throw new BusinessException(ErrorCode.WILAYA_INVALID_TRANSITION, status, WilayaStatus.INACTIVE);
        this.status = WilayaStatus.INACTIVE;
        touch(actorId);
    }

    public void reactivate(String actorId) {
        if (status != WilayaStatus.INACTIVE)
            throw new BusinessException(ErrorCode.WILAYA_INVALID_TRANSITION, status, WilayaStatus.ACTIVE);
        this.status = WilayaStatus.ACTIVE;
        touch(actorId);
    }

    public void update(String name, String nameAr, String zone, Integer deliveryCostDzd,
                       String estimatedDays, Boolean deliverable, String notes, String actorId) {
        if (status != WilayaStatus.DRAFT) throw new BusinessException(ErrorCode.WILAYA_NOT_EDITABLE);
        if (name != null) this.name = name;
        if (nameAr != null) this.nameAr = nameAr;
        if (zone != null) this.zone = zone;
        if (deliveryCostDzd != null) this.deliveryCostDzd = deliveryCostDzd;
        if (estimatedDays != null) this.estimatedDays = estimatedDays;
        if (deliverable != null) this.deliverable = deliverable;
        if (notes != null) this.notes = notes;
        touch(actorId);
    }

    private void touch(String actorId) {
        this.updatedBy = actorId;
        this.updatedAt = Instant.now();
    }
}

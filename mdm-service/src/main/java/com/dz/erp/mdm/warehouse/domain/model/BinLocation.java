package com.dz.erp.mdm.warehouse.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.time.Instant;
import java.util.Objects;

@Getter
@EqualsAndHashCode(of = {"binCode", "tenantId"})
public class BinLocation {
    private final String binCode;
    private final String tenantId;
    private String zone;
    private String rack;
    private String shelf;
    private int maxCapacity;
    private int currentOccupancy;
    private int reservedCapacity;
    private BinType binType;
    private BinStatus status;
    private String notes;
    private final String createdBy;
    private final Instant createdAt;
    private String updatedBy;
    private Instant updatedAt;
    private long version;

    public static BinLocation create(String binCode, String tenantId, String zone, String rack,
                                     String shelf, int maxCapacity, BinType binType, String notes, String createdBy) {
        Objects.requireNonNull(binCode);
        Objects.requireNonNull(zone);
        if (maxCapacity <= 0) throw new IllegalArgumentException("maxCapacity must be positive");
        return new BinLocation(binCode.trim().toUpperCase(), tenantId, zone, rack, shelf,
                maxCapacity, 0, 0, binType, BinStatus.DRAFT, notes,
                Objects.requireNonNull(createdBy), Instant.now(), null, null, 0);
    }

    public static BinLocation reconstitute(String binCode, String tenantId, String zone, String rack,
                                           String shelf, int maxCapacity, int currentOccupancy, int reservedCapacity,
                                           BinType binType, BinStatus status, String notes,
                                           String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {
        return new BinLocation(binCode, tenantId, zone, rack, shelf, maxCapacity,
                currentOccupancy, reservedCapacity, binType, status, notes,
                createdBy, createdAt, updatedBy, updatedAt, version);
    }

    private BinLocation(String binCode, String tenantId, String zone, String rack, String shelf,
                        int maxCapacity, int currentOccupancy, int reservedCapacity, BinType binType,
                        BinStatus status, String notes, String createdBy, Instant createdAt,
                        String updatedBy, Instant updatedAt, long version) {
        this.binCode = binCode;
        this.tenantId = tenantId;
        this.zone = zone;
        this.rack = rack;
        this.shelf = shelf;
        this.maxCapacity = maxCapacity;
        this.currentOccupancy = currentOccupancy;
        this.reservedCapacity = reservedCapacity;
        this.binType = binType;
        this.status = status;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    public void activate(String activatorId) {
        if (status != BinStatus.DRAFT)
            throw new BusinessException(ErrorCode.BIN_INVALID_TRANSITION, status, BinStatus.ACTIVE);
        if (createdBy.equals(activatorId)) throw new BusinessException(ErrorCode.BIN_SOD_VIOLATION);
        this.status = BinStatus.ACTIVE;
        touch(activatorId);
    }

    public void deactivate(String actorId) {
        if (status != BinStatus.ACTIVE)
            throw new BusinessException(ErrorCode.BIN_INVALID_TRANSITION, status, BinStatus.INACTIVE);
        this.status = BinStatus.INACTIVE;
        touch(actorId);
    }

    public void reactivate(String actorId) {
        if (status != BinStatus.INACTIVE)
            throw new BusinessException(ErrorCode.BIN_INVALID_TRANSITION, status, BinStatus.ACTIVE);
        this.status = BinStatus.ACTIVE;
        touch(actorId);
    }

    public void update(String zone, String rack, String shelf, Integer maxCapacity, BinType binType, String notes, String actorId) {
        if (status != BinStatus.DRAFT) throw new BusinessException(ErrorCode.BIN_NOT_EDITABLE);
        if (zone != null) this.zone = zone;
        if (rack != null) this.rack = rack;
        if (shelf != null) this.shelf = shelf;
        if (maxCapacity != null) this.maxCapacity = maxCapacity;
        if (binType != null) this.binType = binType;
        if (notes != null) this.notes = notes;
        touch(actorId);
    }

    public int remainingCapacity() {
        return maxCapacity - currentOccupancy - reservedCapacity;
    }

    public void reserve(int qty) {
        if (currentOccupancy + reservedCapacity + qty > maxCapacity)
            throw new BusinessException(ErrorCode.BIN_AT_CAPACITY);
        this.reservedCapacity += qty;
    }

    private void touch(String actorId) {
        this.updatedBy = actorId;
        this.updatedAt = Instant.now();
    }
}

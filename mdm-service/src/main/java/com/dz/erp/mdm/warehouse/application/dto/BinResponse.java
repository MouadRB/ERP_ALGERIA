package com.dz.erp.mdm.warehouse.application.dto;
import java.time.Instant;
public record BinResponse(String binCode, String tenantId, String zone, String rack, String shelf,
    int maxCapacity, int currentOccupancy, int reservedCapacity, int remainingCapacity,
    String binType, String status, String notes,
    String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {}

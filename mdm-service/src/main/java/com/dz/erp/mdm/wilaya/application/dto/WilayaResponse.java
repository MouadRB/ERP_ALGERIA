package com.dz.erp.mdm.wilaya.application.dto;
import java.time.Instant;
public record WilayaResponse(String wilayaCode, String tenantId, String name, String nameAr,
    String zone, int deliveryCostDzd, String estimatedDays, boolean deliverable, String notes,
    String status, String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {}

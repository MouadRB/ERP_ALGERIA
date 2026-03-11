package com.dz.erp.mdm.supplier.application.dto;
import java.time.Instant;
public record SupplierResponse(String supplierCode, String tenantId, String companyName,
    String contactName, String phone, String email, String address, String wilayaCode,
    String taxId, int paymentTermDays, String status, String notes,
    String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {}

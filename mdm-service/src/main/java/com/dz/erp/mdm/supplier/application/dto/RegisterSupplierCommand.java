package com.dz.erp.mdm.supplier.application.dto;
import jakarta.validation.constraints.NotBlank;
public record RegisterSupplierCommand(
    @NotBlank String supplierCode, @NotBlank String companyName, String contactName,
    @NotBlank String phone, String email, String address, String wilayaCode,
    String taxId, Integer paymentTermDays, String notes) {}

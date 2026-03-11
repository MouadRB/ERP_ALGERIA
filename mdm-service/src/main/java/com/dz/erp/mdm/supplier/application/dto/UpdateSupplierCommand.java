package com.dz.erp.mdm.supplier.application.dto;
public record UpdateSupplierCommand(String companyName, String contactName, String phone,
    String email, String address, String wilayaCode, String taxId,
    Integer paymentTermDays, String notes) {}

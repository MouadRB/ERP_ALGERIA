package com.dz.erp.mdm.supplier.application.dto;
import com.dz.erp.mdm.supplier.domain.model.SupplierStatus;
public record SupplierSearchQuery(String searchTerm, SupplierStatus status, String wilayaCode, int page, int size) {
    public SupplierSearchQuery { if (size <= 0) size = 25; if (page < 0) page = 0; }
}

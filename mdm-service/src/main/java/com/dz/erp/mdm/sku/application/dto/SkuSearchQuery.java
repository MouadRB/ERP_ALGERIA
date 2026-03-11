package com.dz.erp.mdm.sku.application.dto;

import com.dz.erp.mdm.sku.domain.model.SkuStatus;

public record SkuSearchQuery(String searchTerm, SkuStatus status, int page, int size) {
    public SkuSearchQuery { if (size <= 0) size = 25; if (page < 0) page = 0; }
}

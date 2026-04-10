package com.dz.erp.pim.product.application.dto;

import com.dz.erp.pim.product.domain.model.ProductStatus;

public record ProductSearchQuery(String search, String categoryCode, ProductStatus status,
                                 String supplierCode, int page, int size) {
    public ProductSearchQuery {
        if (size <= 0) size = 25;
        if (page < 0) page = 0;
    }
}

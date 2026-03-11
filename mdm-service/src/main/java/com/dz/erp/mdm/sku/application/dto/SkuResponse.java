package com.dz.erp.mdm.sku.application.dto;

import java.time.Instant;

public record SkuResponse(
        String skuCode, String tenantId, String baseUom, String productType,
        String status, String createdBy, Instant createdAt,
        String updatedBy, Instant updatedAt, long version
) {
}

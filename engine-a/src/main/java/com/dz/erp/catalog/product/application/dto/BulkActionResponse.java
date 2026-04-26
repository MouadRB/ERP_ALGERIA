package com.dz.erp.catalog.product.application.dto;
import java.util.List;
public record BulkActionResponse(int total, int success, int failed, List<SkuResult> results) {
    public record SkuResult(String skuCode, boolean success, String error) {}
}

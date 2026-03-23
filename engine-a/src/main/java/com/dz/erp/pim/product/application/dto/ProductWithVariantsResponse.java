package com.dz.erp.pim.product.application.dto;
import com.dz.erp.pim.variant.application.dto.VariantResponse;
import java.util.List;
public record ProductWithVariantsResponse(ProductResponse product, List<VariantResponse> variants,
    int totalStock, int activeVariantCount) {}

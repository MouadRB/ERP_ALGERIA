package com.dz.erp.catalog.search.application.dto;

import java.util.List;

public record SearchResultResponse(
        List<ProductHit> hits,
        long totalHits,
        long tookMs,
        int page,
        int size
) {
    public record ProductHit(
            String skuCode,
            String nameFr,
            String nameAr,
            String principalImageUrl,
            String priceTtc,
            int stockDisponible,
            List<String> badges,
            double score
    ) {}
}

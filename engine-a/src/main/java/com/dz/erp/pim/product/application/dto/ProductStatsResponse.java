package com.dz.erp.pim.product.application.dto;

public record ProductStatsResponse(long activeProducts, long pendingActivation,
                                   long highReturnRate, long discontinued, long ocrReviewRequired) {
}

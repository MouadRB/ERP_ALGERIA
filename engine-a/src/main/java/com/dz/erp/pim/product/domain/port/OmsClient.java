package com.dz.erp.pim.product.domain.port;

import java.math.BigDecimal;
import java.util.List;

public interface OmsClient {
    record ReturnRateDto(String skuCode, BigDecimal returnRate) {
    }

    List<ReturnRateDto> getAllReturnRates(String tenantId);
}

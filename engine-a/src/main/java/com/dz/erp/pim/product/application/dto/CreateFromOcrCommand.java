package com.dz.erp.pim.product.application.dto;

import java.math.BigDecimal;

public record CreateFromOcrCommand(String skuCode, String supplierCode, String categoryCode,
                                   String nameFr) {
}

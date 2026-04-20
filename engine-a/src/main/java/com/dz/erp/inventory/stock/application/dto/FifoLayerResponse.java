package com.dz.erp.inventory.stock.application.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record FifoLayerResponse(
    String layerId, int layerNumber, Instant receptionDate,
    String purchaseOrderRef, String supplierCode,
    int initialQuantity, int remainingQuantity,
    BigDecimal unitCost, BigDecimal remainingValue, String status
) {}

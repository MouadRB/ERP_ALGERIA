package com.dz.erp.mdm.sku.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterSkuCommand(
        @NotBlank String skuCode,
        @NotBlank String baseUom,
        @NotNull String productType
) {}

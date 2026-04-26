package com.dz.erp.catalog.product.application.dto;
import jakarta.validation.constraints.NotBlank;
public record UnpublishProductCommand(@NotBlank String skuCode) {}

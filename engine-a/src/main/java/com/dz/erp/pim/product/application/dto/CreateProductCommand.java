package com.dz.erp.pim.product.application.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateProductCommand(@NotBlank String skuCode, String supplierCode, String supplierRef,
                                   String categoryCode, @NotBlank String nameFr, @NotBlank String nameAr,
                                   String descriptionFr, String descriptionAr, String brand, String model,
                                   String origin, String barcode, String returnPolicy) {
}

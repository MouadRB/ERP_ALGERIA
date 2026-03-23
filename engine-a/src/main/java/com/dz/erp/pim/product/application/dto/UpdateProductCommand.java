package com.dz.erp.pim.product.application.dto;
public record UpdateProductCommand(String nameFr, String nameAr, String descriptionFr, String descriptionAr,
    String brand, String model, String origin, String barcode, String supplierRef, String returnPolicy) {}

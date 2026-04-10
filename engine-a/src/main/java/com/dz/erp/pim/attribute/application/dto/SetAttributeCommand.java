package com.dz.erp.pim.attribute.application.dto;
import jakarta.validation.constraints.NotBlank;
public record SetAttributeCommand(@NotBlank String key, @NotBlank String valueFr, String valueAr, String unit) {}

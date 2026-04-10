package com.dz.erp.pim.logistics.application.dto;
import jakarta.validation.constraints.NotBlank;
public record AddWilayaRestrictionCommand(@NotBlank String wilayaCode, String reason) {}

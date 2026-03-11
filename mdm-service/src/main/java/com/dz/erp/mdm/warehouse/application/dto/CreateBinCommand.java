package com.dz.erp.mdm.warehouse.application.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
public record CreateBinCommand(@NotBlank String binCode, @NotBlank String zone, String rack, String shelf,
    @Positive int maxCapacity, String binType, String notes) {}

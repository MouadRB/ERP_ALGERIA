package com.dz.erp.mdm.wilaya.application.dto;
import jakarta.validation.constraints.NotBlank;
public record CreateWilayaCommand(@NotBlank String wilayaCode, @NotBlank String name, String nameAr,
    String zone, int deliveryCostDzd, String estimatedDays, boolean deliverable, String notes) {}

package com.dz.erp.inventory.returns.application.dto;

import jakarta.validation.constraints.NotBlank;

public record InspectReturnCommand(
    @NotBlank String decision,
    String rejectionReason,
    String disposition
) {}

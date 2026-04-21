package com.dz.erp.oms.returns.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateReturnRequestCommand(
        @NotNull UUID orderId,
        @NotBlank String reasonCode,
        String reasonMessage,
        @NotEmpty @Valid List<LineCommand> lines
) {
    public record LineCommand(
            @NotBlank String skuCode,
            UUID variantId,
            @Positive int quantity,
            BigDecimal refundAmount,
            String reasonCode
    ) {}
}

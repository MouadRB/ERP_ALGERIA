package com.dz.erp.catalog.product.application.dto;
import com.dz.erp.catalog.shared.domain.ChannelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public record ToggleChannelCommand(@NotBlank String skuCode, @NotNull ChannelType channel, boolean enabled) {}

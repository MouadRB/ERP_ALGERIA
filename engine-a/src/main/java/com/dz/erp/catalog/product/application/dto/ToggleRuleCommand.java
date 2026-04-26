package com.dz.erp.catalog.product.application.dto;
import com.dz.erp.catalog.shared.domain.VisibilityRule;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public record ToggleRuleCommand(@NotBlank String skuCode, @NotNull VisibilityRule rule, boolean enabled) {}

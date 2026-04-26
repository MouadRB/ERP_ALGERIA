package com.dz.erp.catalog.product.application.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
public record SchedulePublicationCommand(@NotBlank String skuCode, @NotNull LocalDateTime scheduledAt) {}

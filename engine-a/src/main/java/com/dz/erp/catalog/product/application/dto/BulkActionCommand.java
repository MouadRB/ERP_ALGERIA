package com.dz.erp.catalog.product.application.dto;

import com.dz.erp.catalog.shared.domain.ChannelType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public record BulkActionCommand(
        @NotEmpty List<String> skuCodes,
        @NotNull Action action,
        Set<ChannelType> channels,
        LocalDateTime scheduledAt
) {
    public enum Action {PUBLISH, UNPUBLISH, SCHEDULE, CHANGE_CHANNEL}
}

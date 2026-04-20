package com.dz.erp.catalog.channel.application.dto;

import com.dz.erp.catalog.shared.domain.ChannelType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Command to update a channel's visibility rules.
 */
public record UpdateChannelRulesCommand(
        @NotNull ChannelType channelType,
        boolean autoMaskOnZeroStock,
        boolean autoRepublishOnStock,
        boolean excludeZeroPrice,
        boolean excludeNegativeStock,
        boolean excludeOcrDraft,
        boolean excludeVariantsIndividual,
        @Min(0) Integer minPriceDzd,
        @Min(0) Integer maxPriceDzd
) {}

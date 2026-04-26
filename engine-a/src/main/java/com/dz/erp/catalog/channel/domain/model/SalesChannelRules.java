package com.dz.erp.catalog.channel.domain.model;

/**
 * Value object — immutable rule configuration per sales channel.
 * Embedded inside SalesChannel aggregate. Never persisted independently.
 *
 * Validation enforced at construction — invalid rule combinations
 * are rejected before they reach the database.
 */
public record SalesChannelRules(
        boolean autoMaskOnZeroStock,
        boolean autoRepublishOnStock,
        boolean excludeZeroPrice,
        boolean excludeNegativeStock,
        boolean excludeOcrDraft,
        boolean excludeVariantsIndividual,
        Integer minPriceDzd,
        Integer maxPriceDzd
) {

    public SalesChannelRules {
        if (minPriceDzd != null && minPriceDzd < 0) {
            throw new IllegalArgumentException("minPriceDzd must be >= 0, got: " + minPriceDzd);
        }
        if (maxPriceDzd != null && maxPriceDzd < 0) {
            throw new IllegalArgumentException("maxPriceDzd must be >= 0, got: " + maxPriceDzd);
        }
        if (minPriceDzd != null && maxPriceDzd != null && minPriceDzd >= maxPriceDzd) {
            throw new IllegalArgumentException(
                    "minPriceDzd (" + minPriceDzd + ") must be < maxPriceDzd (" + maxPriceDzd + ")");
        }
        if (!autoMaskOnZeroStock && autoRepublishOnStock) {
            throw new IllegalArgumentException(
                    "Cannot enable autoRepublishOnStock when autoMaskOnZeroStock is disabled — " +
                    "there would be no masked products to republish");
        }
    }

    /** Default rules for Website channel. */
    public static SalesChannelRules webDefaults() {
        return new SalesChannelRules(true, true, true, true, true, false, 0, null);
    }

    /** Default rules for WhatsApp channel — stricter price bounds. */
    public static SalesChannelRules whatsAppDefaults() {
        return new SalesChannelRules(true, true, true, true, true, true, 500, 50_000);
    }
}

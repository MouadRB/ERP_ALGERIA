package com.dz.erp.inventory.stock.domain.model;

/**
 * All possible stock movement types.
 * Positive direction (inbound): RECEPTION, RESERVE_RELEASE, RETURN_QUARANTINE, RETURN_APPROVED, ADJUSTMENT_IN
 * Negative direction (outbound): SOFT_RESERVE, HARD_RESERVE, EXPEDITION, RETURN_REJECTED, ADJUSTMENT_OUT
 * Neutral (bucket transfer): SOFT_TO_HARD_UPGRADE
 */
public enum MovementType {
    RECEPTION,
    SOFT_RESERVE,
    HARD_RESERVE,
    RESERVE_RELEASE,
    SOFT_TO_HARD_UPGRADE,
    EXPEDITION,
    RETURN_QUARANTINE,
    RETURN_APPROVED,
    RETURN_REJECTED,
    ADJUSTMENT_IN,
    ADJUSTMENT_OUT
}

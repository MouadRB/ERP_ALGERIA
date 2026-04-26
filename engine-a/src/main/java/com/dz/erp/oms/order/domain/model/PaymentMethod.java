package com.dz.erp.oms.order.domain.model;

/**
 * Payment method declared at intake.
 *
 * <p>Drives the transition out of {@link OrderStatus#RESERVED}:
 * <ul>
 *   <li>{@link #COD} — auto-confirm; upgrade SOFT → HARD reservation immediately.</li>
 *   <li>{@link #PREPAID} — wait for a captured {@code Payment} before confirming.</li>
 * </ul>
 */
public enum PaymentMethod {
    COD,
    PREPAID
}

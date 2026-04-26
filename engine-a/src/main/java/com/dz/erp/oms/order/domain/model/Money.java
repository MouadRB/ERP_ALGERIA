package com.dz.erp.oms.order.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Money value object — amount + ISO currency code.
 *
 * <p>All monetary values in OMS use {@link BigDecimal} with scale 2 (HALF_UP).
 * Currency comparison is exact-string — no cross-currency arithmetic is allowed.
 */
public record Money(BigDecimal amount, String currency) {

    public Money {
        if (amount == null) throw new IllegalArgumentException("amount is required");
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("currency is required");
        }
        amount = amount.setScale(2, RoundingMode.HALF_UP);
    }

    public static Money of(BigDecimal amount, String currency) {
        return new Money(amount, currency);
    }

    public static Money zero(String currency) {
        return new Money(BigDecimal.ZERO, currency);
    }

    public Money plus(Money other) {
        requireSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money times(int quantity) {
        return new Money(this.amount.multiply(BigDecimal.valueOf(quantity)), this.currency);
    }

    private void requireSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                    "currency mismatch: " + this.currency + " vs " + other.currency);
        }
    }
}

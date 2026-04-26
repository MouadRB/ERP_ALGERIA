package com.dz.erp.oms.shared.port;

import java.util.UUID;

/**
 * Outbound port for OMS → Inventory reservation calls. The order domain never
 * imports inventory types directly; the adapter translates calls into
 * {@code ReservationService} invocations.
 */
public interface InventoryReservationPort {

    UUID softReserve(UUID orderId, String skuCode, int quantity);

    void upgradeToHard(UUID reservationId);

    void release(UUID reservationId);

    /** Thrown by {@link #softReserve} when stock cannot be taken. */
    class InsufficientStockException extends RuntimeException {
        private final String skuCode;
        public InsufficientStockException(String skuCode, String message) {
            super(message);
            this.skuCode = skuCode;
        }
        public String skuCode() { return skuCode; }
    }
}

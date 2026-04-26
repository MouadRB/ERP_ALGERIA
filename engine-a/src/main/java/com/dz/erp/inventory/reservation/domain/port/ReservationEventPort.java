package com.dz.erp.inventory.reservation.domain.port;

public interface ReservationEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

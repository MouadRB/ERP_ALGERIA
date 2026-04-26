package com.dz.erp.inventory.reservation.domain.port;

import com.dz.erp.inventory.reservation.domain.model.Reservation;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository {
    Reservation save(Reservation reservation);
    Optional<Reservation> findById(String reservationId, String tenantId);
    List<Reservation> findByOrderId(String orderId, String tenantId);
    List<Reservation> findActiveByStockRecordId(String stockRecordId, String tenantId);
    List<Reservation> findExpiredSoftReserves();
}

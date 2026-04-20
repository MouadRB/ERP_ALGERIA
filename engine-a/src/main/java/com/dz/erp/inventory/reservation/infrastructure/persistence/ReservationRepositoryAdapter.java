package com.dz.erp.inventory.reservation.infrastructure.persistence;

import com.dz.erp.inventory.reservation.domain.model.Reservation;
import com.dz.erp.inventory.reservation.domain.port.ReservationRepository;
import com.dz.erp.inventory.reservation.infrastructure.mapper.ReservationPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ReservationRepositoryAdapter implements ReservationRepository {
    private final ReservationSpringDataRepository jpa;
    private final ReservationPersistenceMapper m;

    @Override
    public Reservation save(Reservation r) {
        return m.toDomain(jpa.save(m.toJpa(r)));
    }

    @Override
    public Optional<Reservation> findById(String reservationId, String tenantId) {
        return jpa.findByReservationIdAndTenantId(reservationId, tenantId).map(m::toDomain);
    }

    @Override
    public List<Reservation> findByOrderId(String orderId, String tenantId) {
        return jpa.findByOrderIdAndTenantId(orderId, tenantId).stream().map(m::toDomain).toList();
    }

    @Override
    public List<Reservation> findActiveByStockRecordId(String stockRecordId, String tenantId) {
        return jpa.findActiveByStockRecordId(stockRecordId, tenantId).stream().map(m::toDomain).toList();
    }

    @Override
    public List<Reservation> findExpiredSoftReserves() {
        return jpa.findExpiredSoftReserves().stream().map(m::toDomain).toList();
    }
}

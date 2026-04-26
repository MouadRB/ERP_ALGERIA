package com.dz.erp.inventory.reservation.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReservationSpringDataRepository extends JpaRepository<ReservationJpaEntity, String> {

    Optional<ReservationJpaEntity> findByReservationIdAndTenantId(String reservationId, String tenantId);

    List<ReservationJpaEntity> findByOrderIdAndTenantId(String orderId, String tenantId);

    @Query("SELECT r FROM ReservationJpaEntity r " +
            "WHERE r.stockRecordId = :srid AND r.tenantId = :tid AND r.status = 'ACTIVE'")
    List<ReservationJpaEntity> findActiveByStockRecordId(@Param("srid") String stockRecordId,
                                                          @Param("tid") String tenantId);

    @Query("SELECT r FROM ReservationJpaEntity r " +
            "WHERE r.status = 'ACTIVE' AND r.reservationType = 'SOFT' " +
            "AND r.expiresAt IS NOT NULL AND r.expiresAt < CURRENT_TIMESTAMP")
    List<ReservationJpaEntity> findExpiredSoftReserves();
}

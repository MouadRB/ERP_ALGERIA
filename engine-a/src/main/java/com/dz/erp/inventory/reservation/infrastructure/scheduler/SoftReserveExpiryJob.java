package com.dz.erp.inventory.reservation.infrastructure.scheduler;

import com.dz.erp.inventory.reservation.domain.port.ReservationEventPort;
import com.dz.erp.inventory.reservation.domain.port.ReservationRepository;
import com.dz.erp.inventory.stock.domain.event.InventoryDomainEvent;
import com.dz.erp.inventory.stock.domain.model.MovementType;
import com.dz.erp.inventory.stock.domain.model.StockMovement;
import com.dz.erp.inventory.stock.domain.port.StockMovementRepository;
import com.dz.erp.inventory.stock.domain.port.StockRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SoftReserveExpiryJob {
    private final ReservationRepository reservationRepo;
    private final StockRecordRepository stockRecordRepo;
    private final StockMovementRepository movementRepo;
    private final ReservationEventPort reservationEventPort;

    @Scheduled(fixedDelayString = "${app.inventory.reserve-expiry-check-ms:60000}")
    @Transactional
    public void expireStaleReserves() {
        var expired = reservationRepo.findExpiredSoftReserves();
        for (var reservation : expired) {
            reservation.expire();
            reservationRepo.save(reservation);

            var record = stockRecordRepo.findByIdForUpdate(reservation.getStockRecordId(), reservation.getTenantId())
                    .orElse(null);
            if (record != null) {
                int qtyBefore = record.getTotalQuantity();
                record.releaseSoftReserve(reservation.getQuantity(), "SYSTEM");
                stockRecordRepo.save(record);

                var prevHash = movementRepo.findLastHash(record.getStockRecordId()).orElse(null);
                movementRepo.save(StockMovement.create(
                        reservation.getTenantId(), record.getStockRecordId(), record.getSkuCode(),
                        MovementType.RESERVE_RELEASE, reservation.getQuantity(),
                        qtyBefore, record.getTotalQuantity(),
                        null, null, "ORDER", reservation.getOrderId(),
                        "EXPIRED", null, "SYSTEM", prevHash));

                var event = new InventoryDomainEvent.ReservationExpired(
                        UUID.randomUUID().toString(), "ReservationExpired", 1,
                        reservation.getTenantId(), "Reservation", reservation.getReservationId(),
                        Instant.now(),
                        reservation.getOrderId(), reservation.getSkuCode(), reservation.getQuantity());
                reservationEventPort.publish("ReservationExpired", reservation.getReservationId(), event);

                log.info("Expired soft reserve {} for order {}, released {} units",
                        reservation.getReservationId(), reservation.getOrderId(), reservation.getQuantity());
            }
        }
        if (!expired.isEmpty()) {
            log.info("Expired {} stale soft reserves", expired.size());
        }
    }
}

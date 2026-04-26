package com.dz.erp.inventory.reservation.application.service;

import com.dz.erp.inventory.reservation.application.dto.CreateReservationCommand;
import com.dz.erp.inventory.reservation.application.dto.ReservationResponse;
import com.dz.erp.inventory.reservation.domain.model.Reservation;
import com.dz.erp.inventory.reservation.domain.model.ReservationStatus;
import com.dz.erp.inventory.reservation.domain.model.ReservationType;
import com.dz.erp.inventory.reservation.domain.port.ReservationRepository;
import com.dz.erp.inventory.reservation.infrastructure.mapper.ReservationResponseMapper;
import com.dz.erp.inventory.stock.application.service.StockRecordService;
import com.dz.erp.inventory.stock.domain.event.InventoryDomainEvent;
import com.dz.erp.inventory.stock.domain.model.MovementType;
import com.dz.erp.inventory.stock.domain.model.StockMovement;
import com.dz.erp.inventory.reservation.domain.port.ReservationEventPort;
import com.dz.erp.inventory.stock.domain.port.StockEventPort;
import com.dz.erp.inventory.stock.domain.port.StockMovementRepository;
import com.dz.erp.inventory.stock.domain.port.StockRecordRepository;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final ReservationRepository reservationRepo;
    private final StockRecordRepository stockRecordRepo;
    private final StockMovementRepository movementRepo;
    private final StockRecordService stockRecordService;
    private final ReservationEventPort reservationEventPort;
    private final StockEventPort stockEventPort;
    private final ReservationResponseMapper responseMapper;

    // ── Create Soft Reserve ──

    @Transactional
    public ReservationResponse createSoftReserve(CreateReservationCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();

        // Pessimistic lock to prevent overselling
        var record = stockRecordRepo.findByIdForUpdate(
                stockRecordRepo.findBySkuCode(cmd.skuCode(), tid)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND))
                        .getStockRecordId(), tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND));

        int qtyBefore = record.getTotalQuantity();
        record.softReserve(cmd.quantity(), uid);
        stockRecordRepo.save(record);

        Instant expiresAt = calculateBusinessHoursExpiry(Instant.now(), 120);
        var reservation = Reservation.createSoft(tid, record.getStockRecordId(), record.getSkuCode(),
                cmd.orderId(), cmd.clientRef(), cmd.quantity(), expiresAt, cmd.omsStatus(), uid);
        reservation = reservationRepo.save(reservation);

        // Record movement
        var previousHash = movementRepo.findLastHash(record.getStockRecordId()).orElse(null);
        movementRepo.save(StockMovement.create(tid, record.getStockRecordId(), record.getSkuCode(),
                MovementType.SOFT_RESERVE, -cmd.quantity(), qtyBefore, record.getTotalQuantity(),
                null, null, "ORDER", cmd.orderId(), null, null, uid, previousHash));

        // Publish event
        var event = new InventoryDomainEvent.ReservationCreated(
                UUID.randomUUID().toString(), "ReservationCreated", 1, tid,
                "Reservation", reservation.getReservationId(), Instant.now(),
                cmd.orderId(), cmd.skuCode(), "SOFT", cmd.quantity());
        reservationEventPort.publish("ReservationCreated", reservation.getReservationId(), event);

        return responseMapper.toResponse(reservation);
    }

    // ── Upgrade Soft → Hard ──

    @Transactional
    public ReservationResponse upgradeToHard(String reservationId) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();

        var reservation = reservationRepo.findById(reservationId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));

        var record = stockRecordRepo.findByIdForUpdate(reservation.getStockRecordId(), tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND));

        int qtyBefore = record.getTotalQuantity();
        reservation.upgradeToHard();
        record.upgradeSoftToHard(reservation.getQuantity(), uid);

        stockRecordRepo.save(record);
        reservation = reservationRepo.save(reservation);

        // Record movement
        var previousHash = movementRepo.findLastHash(record.getStockRecordId()).orElse(null);
        movementRepo.save(StockMovement.create(tid, record.getStockRecordId(), record.getSkuCode(),
                MovementType.SOFT_TO_HARD_UPGRADE, reservation.getQuantity(), qtyBefore, record.getTotalQuantity(),
                null, null, "ORDER", reservation.getOrderId(), null, null, uid, previousHash));

        return responseMapper.toResponse(reservation);
    }

    // ── Release Reservation ──

    @Transactional
    public void releaseReservation(String reservationId) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();

        var reservation = reservationRepo.findById(reservationId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
        if (reservation.getStatus() != ReservationStatus.ACTIVE
                && reservation.getStatus() != ReservationStatus.UPGRADED)
            throw new BusinessException(ErrorCode.RESERVATION_ALREADY_RELEASED);

        var record = stockRecordRepo.findByIdForUpdate(reservation.getStockRecordId(), tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND));

        int qtyBefore = record.getTotalQuantity();
        if (reservation.getReservationType() == ReservationType.SOFT) {
            record.releaseSoftReserve(reservation.getQuantity(), uid);
        } else {
            record.releaseHardReserve(reservation.getQuantity(), uid);
        }

        reservation.release();
        stockRecordRepo.save(record);
        reservationRepo.save(reservation);

        // Record movement
        var previousHash = movementRepo.findLastHash(record.getStockRecordId()).orElse(null);
        movementRepo.save(StockMovement.create(tid, record.getStockRecordId(), record.getSkuCode(),
                MovementType.RESERVE_RELEASE, reservation.getQuantity(), qtyBefore, record.getTotalQuantity(),
                null, null, "ORDER", reservation.getOrderId(), "CANCELLED", null, uid, previousHash));

        // Publish event
        var event = new InventoryDomainEvent.ReservationReleased(
                UUID.randomUUID().toString(), "ReservationReleased", 1, tid,
                "Reservation", reservation.getReservationId(), Instant.now(),
                reservation.getOrderId(), reservation.getSkuCode(), "CANCELLED");
        reservationEventPort.publish("ReservationReleased", reservation.getReservationId(), event);
    }

    // ── Ship Order ──

    @Transactional
    public void shipOrder(String orderId) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();

        var reservations = reservationRepo.findByOrderId(orderId, tid).stream()
                .filter(r -> r.getStatus() == ReservationStatus.UPGRADED
                        || (r.getStatus() == ReservationStatus.ACTIVE
                        && r.getReservationType() == ReservationType.HARD))
                .toList();

        for (var reservation : reservations) {
            var record = stockRecordRepo.findByIdForUpdate(reservation.getStockRecordId(), tid)
                    .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND));

            int qtyBefore = record.getTotalQuantity();
            record.ship(reservation.getQuantity(), uid);

            // Consume FIFO layers
            BigDecimal fifoCost = stockRecordService.consumeFifo(record.getStockRecordId(), reservation.getQuantity());

            reservation.markShipped();
            stockRecordRepo.save(record);
            reservationRepo.save(reservation);

            // Record movement
            var previousHash = movementRepo.findLastHash(record.getStockRecordId()).orElse(null);
            movementRepo.save(StockMovement.create(tid, record.getStockRecordId(), record.getSkuCode(),
                    MovementType.EXPEDITION, -reservation.getQuantity(), qtyBefore, record.getTotalQuantity(),
                    fifoCost.divide(BigDecimal.valueOf(reservation.getQuantity()), 4, java.math.RoundingMode.HALF_UP),
                    fifoCost, "ORDER", orderId, null, null, uid, previousHash));

            // Publish StockUpdated
            var event = new InventoryDomainEvent.StockUpdated(
                    UUID.randomUUID().toString(), "StockUpdated", 1, tid,
                    "StockRecord", record.getStockRecordId(), Instant.now(),
                    record.getSkuCode(), record.getVariantId(),
                    record.getTotalQuantity(), record.getAvailable());
            stockEventPort.publish("StockUpdated", record.getStockRecordId(), event);

            if (record.isOutOfStock()) {
                var zeroEvent = new InventoryDomainEvent.StockZero(
                        UUID.randomUUID().toString(), "StockZero", 1, tid,
                        "StockRecord", record.getStockRecordId(), Instant.now(),
                        record.getSkuCode());
                stockEventPort.publish("StockZero", record.getStockRecordId(), zeroEvent);
            }
        }
    }

    // ── Queries ──

    @Transactional(readOnly = true)
    public List<ReservationResponse> findByOrderId(String orderId) {
        var tid = AuthContext.currentTenantId();
        return reservationRepo.findByOrderId(orderId, tid).stream()
                .map(responseMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> findActiveByStockRecordId(String stockRecordId) {
        var tid = AuthContext.currentTenantId();
        return reservationRepo.findActiveByStockRecordId(stockRecordId, tid).stream()
                .map(responseMapper::toResponse).toList();
    }

    // ── Business hours expiry (Algeria: Sun-Thu 08:00-17:00) ──

    private Instant calculateBusinessHoursExpiry(Instant from, int businessMinutes) {
        ZonedDateTime zdt = from.atZone(ZoneId.of("Africa/Algiers"));
        int remaining = businessMinutes;
        while (remaining > 0) {
            if (isBusinessDay(zdt) && isBusinessHour(zdt)) {
                remaining--;
            }
            zdt = zdt.plusMinutes(1);
        }
        return zdt.toInstant();
    }

    private boolean isBusinessDay(ZonedDateTime zdt) {
        var dow = zdt.getDayOfWeek();
        return dow != DayOfWeek.FRIDAY && dow != DayOfWeek.SATURDAY;
    }

    private boolean isBusinessHour(ZonedDateTime zdt) {
        int hour = zdt.getHour();
        return hour >= 8 && hour < 17;
    }
}

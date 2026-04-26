package com.dz.erp.oms.shared.integration.inventory;

import com.dz.erp.inventory.reservation.application.dto.CreateReservationCommand;
import com.dz.erp.inventory.reservation.application.service.ReservationService;
import com.dz.erp.oms.shared.port.InventoryReservationPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * In-process adapter from the OMS reservation port to the inventory
 * {@link ReservationService}. Translates {@link BusinessException} with stock
 * error codes into the port's {@link InsufficientStockException}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryReservationAdapter implements InventoryReservationPort {

    private final ReservationService reservationService;

    @Override
    public UUID softReserve(UUID orderId, String skuCode, int quantity) {
        try {
            var cmd = new CreateReservationCommand(skuCode, orderId.toString(), null, quantity, "VALIDATED");
            var response = reservationService.createSoftReserve(cmd);
            log.info("SOFT reserved {} units of {} for order {} → reservationId={}",
                    quantity, skuCode, orderId, response.reservationId());
            return UUID.fromString(response.reservationId());
        } catch (BusinessException e) {
            if (e.getErrorCode() == ErrorCode.STOCK_INSUFFICIENT
                    || e.getErrorCode() == ErrorCode.STOCK_INSUFFICIENT_SOFT_RESERVE
                    || e.getErrorCode() == ErrorCode.STOCK_RECORD_NOT_FOUND) {
                throw new InsufficientStockException(skuCode, e.getMessage());
            }
            throw e;
        }
    }

    @Override
    public void upgradeToHard(UUID reservationId) {
        reservationService.upgradeToHard(reservationId.toString());
        log.info("Upgraded reservation {} SOFT → HARD", reservationId);
    }

    @Override
    public void release(UUID reservationId) {
        reservationService.releaseReservation(reservationId.toString());
        log.info("Released reservation {}", reservationId);
    }
}

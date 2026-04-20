package com.dz.erp.oms.integration.Api;

import com.dz.erp.oms.common.OmsApiPaths;
import com.dz.erp.oms.integration.application.dto.CarrierShipmentResponse;
import com.dz.erp.oms.integration.domain.model.CarrierShipment;
import com.dz.erp.oms.integration.domain.port.CarrierShipmentRepositoryPort;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(OmsApiPaths.SHIPMENTS)
@RequiredArgsConstructor
public class ShipmentController {

    private final CarrierShipmentRepositoryPort shipmentRepo;

    @GetMapping("/{shipmentId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<CarrierShipmentResponse> getOne(@PathVariable UUID shipmentId) {
        var s = shipmentRepo.findById(AuthContext.currentTenantId(), shipmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_SHIPMENT_NOT_FOUND, shipmentId));
        return ApiResult.ok(toResponse(s));
    }

    @GetMapping("/by-order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<CarrierShipmentResponse> getByOrder(@PathVariable UUID orderId) {
        var s = shipmentRepo.findByOrderId(AuthContext.currentTenantId(), orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_SHIPMENT_NOT_FOUND, orderId));
        return ApiResult.ok(toResponse(s));
    }

    private CarrierShipmentResponse toResponse(CarrierShipment s) {
        return new CarrierShipmentResponse(
                s.getShipmentId(), s.getOrderId(), s.getCarrierCode(), s.getStatus(),
                s.getTrackingNumber(), s.getLabelUrl(),
                s.getFailureReasonCode(), s.getFailureReasonMessage(),
                s.getCreatedAt(), s.getSubmittedAt(), s.getPickedUpAt(),
                s.getDeliveredAt(), s.getUpdatedAt());
    }
}

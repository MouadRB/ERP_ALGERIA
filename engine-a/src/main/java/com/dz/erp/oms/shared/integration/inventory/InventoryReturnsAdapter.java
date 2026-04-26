package com.dz.erp.oms.shared.integration.inventory;

import com.dz.erp.inventory.returns.application.dto.CreateReturnCommand;
import com.dz.erp.inventory.returns.application.dto.InspectReturnCommand;
import com.dz.erp.inventory.returns.application.service.ReturnInspectionService;
import com.dz.erp.inventory.returns.domain.model.ProductCondition;
import com.dz.erp.inventory.returns.domain.model.ReturnReason;
import com.dz.erp.oms.shared.port.InventoryReturnsPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Adapter to the inventory-side returns service. OMS owns the customer-facing return
 * lifecycle; Inventory owns quarantine + disposition + restocking.
 *
 * <p>The OMS port does not carry a return reason — inventory needs one to persist the
 * quarantine row, so the adapter defaults to {@link ReturnReason#CHANGED_MIND} and
 * {@link ProductCondition#NEW}. The inspector updates these on approval/rejection.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryReturnsAdapter implements InventoryReturnsPort {

    private static final String ORDER_REF_PREFIX = "OMS-RETURN-";

    private final ReturnInspectionService service;

    @Override
    public String openInspection(String tenantId, String skuCode, int quantity, String actorUserId) {
        var cmd = new CreateReturnCommand(
                skuCode,
                ORDER_REF_PREFIX + UUID.randomUUID(),
                actorUserId,
                ReturnReason.CHANGED_MIND.name(),
                ProductCondition.NEW.name(),
                quantity);
        var response = service.createReturn(cmd);
        log.info("Opened inventory inspection {} for SKU {} qty {} (tenant {})",
                response.inspectionId(), skuCode, quantity, tenantId);
        return response.inspectionId();
    }

    @Override
    public void approveInspection(String tenantId, String inspectionId, String actorUserId) {
        service.approveReturn(inspectionId);
        log.info("Approved inspection {} (tenant {}, actor {})", inspectionId, tenantId, actorUserId);
    }

    @Override
    public void rejectInspection(String tenantId, String inspectionId, String actorUserId) {
        var cmd = new InspectReturnCommand("REJECT", "OMS_RETURN_REJECTED", null);
        service.rejectReturn(inspectionId, cmd);
        log.info("Rejected inspection {} (tenant {}, actor {})", inspectionId, tenantId, actorUserId);
    }
}

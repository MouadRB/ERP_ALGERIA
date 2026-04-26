package com.dz.erp.oms.shared.port;

/**
 * Facade over the Inventory Returns module. OMS kicks off a quarantine entry when
 * arranging pickup and later asks Inventory to approve / reject the inspection.
 */
public interface InventoryReturnsPort {

    String openInspection(String tenantId, String skuCode, int quantity, String actorUserId);

    void approveInspection(String tenantId, String inspectionId, String actorUserId);

    void rejectInspection(String tenantId, String inspectionId, String actorUserId);
}

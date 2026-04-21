package com.dz.erp.inventory.returns.application.dto;

import java.time.Instant;

public record ReturnInspectionResponse(
    String inspectionId, String skuCode, String orderId, String customerRef,
    Instant returnDate, String returnReason, String productCondition,
    int quantity, String inspectionStatus, String inspectorId,
    Instant inspectedAt, String rejectionReason, String disposition
) {}

package com.dz.erp.inventory.returns.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.Getter;
import java.time.Instant;
import java.util.UUID;

@Getter
public class ReturnInspection {
    private final String inspectionId;
    private final String tenantId;
    private final String stockRecordId;
    private final String skuCode;
    private final String orderId;
    private final String customerRef;
    private final Instant returnDate;
    private final ReturnReason returnReason;
    private final ProductCondition productCondition;
    private final int quantity;
    private InspectionStatus inspectionStatus;
    private String inspectorId;
    private Instant inspectedAt;
    private String rejectionReason;
    private Disposition disposition;
    private String fifoLayerId;
    private final String createdBy;
    private final Instant createdAt;
    private long version;

    public static ReturnInspection create(String tenantId, String stockRecordId, String skuCode,
                                           String orderId, String customerRef, ReturnReason returnReason,
                                           ProductCondition productCondition, int quantity, String createdBy) {
        return new ReturnInspection(UUID.randomUUID().toString(), tenantId, stockRecordId, skuCode,
                orderId, customerRef, Instant.now(), returnReason, productCondition, quantity,
                InspectionStatus.PENDING, null, null, null, null, null,
                createdBy, Instant.now(), 0);
    }

    public static ReturnInspection reconstitute(
            String inspectionId, String tenantId, String stockRecordId, String skuCode,
            String orderId, String customerRef, Instant returnDate, ReturnReason returnReason,
            ProductCondition productCondition, int quantity, InspectionStatus inspectionStatus,
            String inspectorId, Instant inspectedAt, String rejectionReason,
            Disposition disposition, String fifoLayerId,
            String createdBy, Instant createdAt, long version) {
        return new ReturnInspection(inspectionId, tenantId, stockRecordId, skuCode,
                orderId, customerRef, returnDate, returnReason, productCondition, quantity,
                inspectionStatus, inspectorId, inspectedAt, rejectionReason,
                disposition, fifoLayerId, createdBy, createdAt, version);
    }

    private ReturnInspection(String inspectionId, String tenantId, String stockRecordId, String skuCode,
                              String orderId, String customerRef, Instant returnDate, ReturnReason returnReason,
                              ProductCondition productCondition, int quantity, InspectionStatus inspectionStatus,
                              String inspectorId, Instant inspectedAt, String rejectionReason,
                              Disposition disposition, String fifoLayerId,
                              String createdBy, Instant createdAt, long version) {
        this.inspectionId = inspectionId;
        this.tenantId = tenantId;
        this.stockRecordId = stockRecordId;
        this.skuCode = skuCode;
        this.orderId = orderId;
        this.customerRef = customerRef;
        this.returnDate = returnDate;
        this.returnReason = returnReason;
        this.productCondition = productCondition;
        this.quantity = quantity;
        this.inspectionStatus = inspectionStatus;
        this.inspectorId = inspectorId;
        this.inspectedAt = inspectedAt;
        this.rejectionReason = rejectionReason;
        this.disposition = disposition;
        this.fifoLayerId = fifoLayerId;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.version = version;
    }

    public void approve(String inspectorId, Disposition disposition, String fifoLayerId) {
        if (this.inspectionStatus != InspectionStatus.PENDING)
            throw new BusinessException(ErrorCode.RETURN_ALREADY_INSPECTED);
        this.inspectionStatus = InspectionStatus.APPROVED;
        this.inspectorId = inspectorId;
        this.inspectedAt = Instant.now();
        this.disposition = disposition;
        this.fifoLayerId = fifoLayerId;
    }

    public void reject(String inspectorId, String rejectionReason) {
        if (this.inspectionStatus != InspectionStatus.PENDING)
            throw new BusinessException(ErrorCode.RETURN_ALREADY_INSPECTED);
        this.inspectionStatus = InspectionStatus.REJECTED;
        this.inspectorId = inspectorId;
        this.inspectedAt = Instant.now();
        this.rejectionReason = rejectionReason;
        this.disposition = Disposition.LOSS;
    }
}

package com.dz.erp.inventory.returns.application.service;

import com.dz.erp.inventory.returns.application.dto.CreateReturnCommand;
import com.dz.erp.inventory.returns.application.dto.InspectReturnCommand;
import com.dz.erp.inventory.returns.application.dto.ReturnInspectionResponse;
import com.dz.erp.inventory.returns.domain.model.*;
import com.dz.erp.inventory.returns.domain.port.ReturnInspectionRepository;
import com.dz.erp.inventory.returns.infrastructure.mapper.ReturnInspectionResponseMapper;
import com.dz.erp.inventory.stock.application.service.InventoryCacheService;
import com.dz.erp.inventory.stock.domain.model.FifoLayer;
import com.dz.erp.inventory.stock.domain.model.MovementType;
import com.dz.erp.inventory.stock.domain.model.StockMovement;
import com.dz.erp.inventory.stock.domain.port.FifoLayerRepository;
import com.dz.erp.inventory.stock.domain.port.StockMovementRepository;
import com.dz.erp.inventory.stock.domain.port.StockRecordRepository;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ReturnInspectionService {
    private final ReturnInspectionRepository returnRepo;
    private final StockRecordRepository stockRecordRepo;
    private final StockMovementRepository movementRepo;
    private final FifoLayerRepository fifoLayerRepo;
    private final InventoryCacheService cacheService;
    private final ReturnInspectionResponseMapper responseMapper;

    // ── Create Return (quarantine) ──

    @Transactional
    public ReturnInspectionResponse createReturn(CreateReturnCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();

        var record = stockRecordRepo.findBySkuCode(cmd.skuCode(), tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND));

        int qtyBefore = record.getTotalQuantity();
        record.addQuarantine(cmd.quantity(), uid);
        stockRecordRepo.save(record);

        var inspection = ReturnInspection.create(tid, record.getStockRecordId(), record.getSkuCode(),
                cmd.orderId(), cmd.customerRef(),
                ReturnReason.valueOf(cmd.returnReason()),
                ProductCondition.valueOf(cmd.productCondition()),
                cmd.quantity(), uid);
        inspection = returnRepo.save(inspection);

        // Record movement
        var previousHash = movementRepo.findLastHash(record.getStockRecordId()).orElse(null);
        movementRepo.save(StockMovement.create(tid, record.getStockRecordId(), record.getSkuCode(),
                MovementType.RETURN_QUARANTINE, cmd.quantity(), qtyBefore, record.getTotalQuantity(),
                null, null, "RETURN", cmd.orderId(),
                cmd.returnReason(), null, uid, previousHash));

        cacheService.evictDashboard(tid);
        return responseMapper.toResponse(inspection);
    }

    // ── Approve Return ──

    @Transactional
    public ReturnInspectionResponse approveReturn(String inspectionId) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();

        var inspection = returnRepo.findById(inspectionId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.RETURN_NOT_FOUND));

        var record = stockRecordRepo.findByIdForUpdate(inspection.getStockRecordId(), tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND));

        int qtyBefore = record.getTotalQuantity();
        record.approveReturn(inspection.getQuantity(), uid);

        // Create new FIFO layer for restocked items (at zero cost — original cost already consumed)
        int nextLayerNum = fifoLayerRepo.nextLayerNumber(record.getStockRecordId());
        var layer = FifoLayer.create(tid, record.getStockRecordId(), record.getSkuCode(),
                nextLayerNum, null, null,
                inspection.getQuantity(), BigDecimal.ZERO);
        layer = fifoLayerRepo.save(layer);

        inspection.approve(uid, Disposition.RESTOCK, layer.getLayerId());
        stockRecordRepo.save(record);
        inspection = returnRepo.save(inspection);

        // Record movement
        var previousHash = movementRepo.findLastHash(record.getStockRecordId()).orElse(null);
        movementRepo.save(StockMovement.create(tid, record.getStockRecordId(), record.getSkuCode(),
                MovementType.RETURN_APPROVED, inspection.getQuantity(), qtyBefore, record.getTotalQuantity(),
                BigDecimal.ZERO, BigDecimal.ZERO, "RETURN", inspection.getOrderId(),
                "APPROVED", layer.getLayerId(), uid, previousHash));

        cacheService.evictDashboard(tid);
        return responseMapper.toResponse(inspection);
    }

    // ── Reject Return ──

    @Transactional
    public ReturnInspectionResponse rejectReturn(String inspectionId, InspectReturnCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();

        var inspection = returnRepo.findById(inspectionId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.RETURN_NOT_FOUND));

        var record = stockRecordRepo.findByIdForUpdate(inspection.getStockRecordId(), tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND));

        int qtyBefore = record.getTotalQuantity();
        record.rejectReturn(inspection.getQuantity(), uid);

        inspection.reject(uid, cmd.rejectionReason());
        stockRecordRepo.save(record);
        inspection = returnRepo.save(inspection);

        // Record movement (permanent exit)
        var previousHash = movementRepo.findLastHash(record.getStockRecordId()).orElse(null);
        movementRepo.save(StockMovement.create(tid, record.getStockRecordId(), record.getSkuCode(),
                MovementType.RETURN_REJECTED, -inspection.getQuantity(), qtyBefore, record.getTotalQuantity(),
                null, null, "RETURN", inspection.getOrderId(),
                cmd.rejectionReason(), null, uid, previousHash));

        cacheService.evictDashboard(tid);
        return responseMapper.toResponse(inspection);
    }

    // ── Queries ──

    @Transactional(readOnly = true)
    public Page<ReturnInspectionResponse> list(InspectionStatus status, Pageable pageable) {
        var tid = AuthContext.currentTenantId();
        return returnRepo.findByTenant(tid, status, pageable).map(responseMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ReturnInspectionResponse getById(String inspectionId) {
        var tid = AuthContext.currentTenantId();
        var inspection = returnRepo.findById(inspectionId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.RETURN_NOT_FOUND));
        return responseMapper.toResponse(inspection);
    }
}

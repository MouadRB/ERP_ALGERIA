package com.dz.erp.inventory.stock.application.service;

import com.dz.erp.inventory.stock.application.dto.*;
import com.dz.erp.inventory.stock.domain.event.InventoryDomainEvent;
import com.dz.erp.inventory.stock.domain.model.*;
import com.dz.erp.inventory.stock.domain.port.FifoLayerRepository;
import com.dz.erp.inventory.stock.domain.port.StockEventPort;
import com.dz.erp.inventory.stock.domain.port.StockMovementRepository;
import com.dz.erp.inventory.stock.domain.port.StockRecordRepository;
import com.dz.erp.inventory.stock.infrastructure.mapper.StockRecordResponseMapper;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockRecordService {
    private final StockRecordRepository stockRecordRepo;
    private final FifoLayerRepository fifoLayerRepo;
    private final StockMovementRepository movementRepo;
    private final StockEventPort eventPort;
    private final InventoryCacheService cacheService;
    private final StockRecordResponseMapper responseMapper;

    // ── Query ──

    @Transactional(readOnly = true)
    public StockRecordResponse getById(String stockRecordId) {
        var tid = AuthContext.currentTenantId();
        var record = findOrThrow(stockRecordId, tid);
        return responseMapper.toResponse(record);
    }

    @Transactional(readOnly = true)
    public StockRecordResponse getBySkuCode(String skuCode) {
        var tid = AuthContext.currentTenantId();
        var record = stockRecordRepo.findBySkuCode(skuCode, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND));
        return responseMapper.toResponse(record);
    }

    @Transactional(readOnly = true)
    public Page<StockRecordResponse> search(String search, StockStatus status, Pageable pageable) {
        var tid = AuthContext.currentTenantId();
        return stockRecordRepo.search(search, status, tid, pageable).map(responseMapper::toResponse);
    }

    // ── Stock Reception (creates FIFO layer) ──

    @Transactional
    public StockRecordResponse receiveStock(String stockRecordId, ReceiveStockCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var record = findOrThrow(stockRecordId, tid);
        int qtyBefore = record.getTotalQuantity();
        boolean wasZero = record.isOutOfStock();

        record.receiveStock(cmd.quantity(), uid);

        // Create FIFO layer
        int nextLayerNum = fifoLayerRepo.nextLayerNumber(record.getStockRecordId());
        var layer = FifoLayer.create(tid, record.getStockRecordId(), record.getSkuCode(),
                nextLayerNum, cmd.purchaseOrderRef(), cmd.supplierCode(),
                cmd.quantity(), cmd.unitCost());
        fifoLayerRepo.save(layer);

        // Recalculate FIFO valuation
        recalculateFifoValuation(record);

        // Record immutable movement
        var previousHash = movementRepo.findLastHash(record.getStockRecordId()).orElse(null);
        var movement = StockMovement.create(tid, record.getStockRecordId(), record.getSkuCode(),
                MovementType.RECEPTION, cmd.quantity(), qtyBefore, record.getTotalQuantity(),
                cmd.unitCost(), cmd.unitCost().multiply(BigDecimal.valueOf(cmd.quantity())),
                "PURCHASE_ORDER", cmd.purchaseOrderRef(), null, layer.getLayerId(), uid, previousHash);
        movementRepo.save(movement);

        record = stockRecordRepo.save(record);

        // Publish events
        publishStockUpdated(record, tid);
        if (wasZero) publishStockReplenished(record, tid);
        publishCostUpdated(record, tid, cmd.purchaseOrderRef());

        cacheService.evictDashboard(tid);
        return responseMapper.toResponse(record);
    }

    // ── Adjustment ──

    @Transactional
    public StockRecordResponse adjustStock(String stockRecordId, AdjustStockCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var record = findOrThrow(stockRecordId, tid);
        int qtyBefore = record.getTotalQuantity();
        boolean wasZero = record.isOutOfStock();

        if (cmd.quantityChange() > 0) record.adjustIn(cmd.quantityChange(), uid);
        else record.adjustOut(Math.abs(cmd.quantityChange()), uid);

        var previousHash = movementRepo.findLastHash(stockRecordId).orElse(null);
        var movement = StockMovement.create(tid, stockRecordId, record.getSkuCode(),
                cmd.quantityChange() > 0 ? MovementType.ADJUSTMENT_IN : MovementType.ADJUSTMENT_OUT,
                cmd.quantityChange(), qtyBefore, record.getTotalQuantity(),
                null, null, "ADJUSTMENT", null, cmd.reason(), null, uid, previousHash);
        movementRepo.save(movement);

        record = stockRecordRepo.save(record);
        publishStockUpdated(record, tid);
        if (wasZero && !record.isOutOfStock()) publishStockReplenished(record, tid);
        if (!wasZero && record.isOutOfStock()) publishStockZero(record, tid);
        cacheService.evictDashboard(tid);
        return responseMapper.toResponse(record);
    }

    // ── Update Thresholds ──

    @Transactional
    public StockRecordResponse updateThresholds(String stockRecordId, UpdateThresholdCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var record = findOrThrow(stockRecordId, tid);
        record.updateThresholds(cmd.reorderThreshold(), cmd.reorderQuantity(), uid);
        record = stockRecordRepo.save(record);
        return responseMapper.toResponse(record);
    }

    /**
     * Called by InventoryEventListener when PIM updates stockAlertThreshold in logistics.
     * Syncs the threshold to the inventory StockRecord so checkStockLevels() uses the correct value.
     */
    @Transactional
    public void updateThresholdsBySkuCode(String skuCode, String tenantId,
                                           int reorderThreshold, int reorderQuantity) {
        stockRecordRepo.findBySkuCode(skuCode, tenantId).ifPresent(record -> {
            record.updateThresholds(reorderThreshold, reorderQuantity, "SYSTEM");
            stockRecordRepo.save(record);
        });
    }

    // ── FIFO Consumption (called internally by ship) ──

    public BigDecimal consumeFifo(String stockRecordId, int quantity) {
        var layers = fifoLayerRepo.findActiveOrderedByLayerNumber(stockRecordId);
        int remaining = quantity;
        BigDecimal totalCost = BigDecimal.ZERO;
        for (var layer : layers) {
            if (remaining <= 0) break;
            int consumed = layer.consume(remaining);
            remaining -= consumed;
            totalCost = totalCost.add(layer.getUnitCost().multiply(BigDecimal.valueOf(consumed)));
            fifoLayerRepo.save(layer);
        }
        if (remaining > 0) throw new BusinessException(ErrorCode.STOCK_FIFO_INSUFFICIENT_LAYERS);
        return totalCost;
    }

    // ── FIFO Valuation recalculation ──

    private void recalculateFifoValuation(StockRecord record) {
        var layers = fifoLayerRepo.findActiveOrderedByLayerNumber(record.getStockRecordId());
        BigDecimal totalValue = BigDecimal.ZERO;
        int totalQty = 0;
        for (var layer : layers) {
            totalValue = totalValue.add(layer.getRemainingValue());
            totalQty += layer.getRemainingQuantity();
        }
        BigDecimal weightedAvg = totalQty > 0
                ? totalValue.divide(BigDecimal.valueOf(totalQty), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        record.updateFifoValuation(totalValue, weightedAvg);
    }

    // ── Initialization (from PIM events) ──

    @Transactional
    public void initializeForProduct(String skuCode, String productId, String tenantId) {
        if (stockRecordRepo.existsBySkuCode(skuCode, tenantId)) return;
        var record = StockRecord.create(tenantId, skuCode, productId, null, 10, 50, "SYSTEM");
        stockRecordRepo.save(record);
    }

    @Transactional
    public void initializeForVariant(String skuCode, String variantId, String tenantId) {
        if (stockRecordRepo.existsBySkuCode(skuCode, tenantId)) return;
        var record = StockRecord.create(tenantId, skuCode, null, variantId, 10, 50, "SYSTEM");
        stockRecordRepo.save(record);
    }

    @Transactional
    public void markTrackable(String skuCode, String tenantId) {
        stockRecordRepo.findBySkuCode(skuCode, tenantId).ifPresent(r -> {
            r.markTrackable();
            stockRecordRepo.save(r);
        });
    }

    @Transactional
    public void freezeStock(String skuCode, String tenantId) {
        stockRecordRepo.findBySkuCode(skuCode, tenantId).ifPresent(r -> {
            r.freeze();
            stockRecordRepo.save(r);
        });
    }

    // ── Helpers ──

    private StockRecord findOrThrow(String stockRecordId, String tenantId) {
        return stockRecordRepo.findById(stockRecordId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_RECORD_NOT_FOUND));
    }

    // ── Event Publishing ──

    private void publishStockUpdated(StockRecord r, String tid) {
        var event = new InventoryDomainEvent.StockUpdated(
                UUID.randomUUID().toString(), "StockUpdated", 1, tid,
                "StockRecord", r.getStockRecordId(), Instant.now(),
                r.getSkuCode(), r.getVariantId(),
                r.getTotalQuantity(), r.getAvailable());
        eventPort.publish("StockUpdated", r.getStockRecordId(), event);
    }

    private void publishStockZero(StockRecord r, String tid) {
        var event = new InventoryDomainEvent.StockZero(
                UUID.randomUUID().toString(), "StockZero", 1, tid,
                "StockRecord", r.getStockRecordId(), Instant.now(),
                r.getSkuCode());
        eventPort.publish("StockZero", r.getStockRecordId(), event);
    }

    private void publishStockReplenished(StockRecord r, String tid) {
        var event = new InventoryDomainEvent.StockReplenished(
                UUID.randomUUID().toString(), "StockReplenished", 1, tid,
                "StockRecord", r.getStockRecordId(), Instant.now(),
                r.getSkuCode());
        eventPort.publish("StockReplenished", r.getStockRecordId(), event);
    }

    private void publishCostUpdated(StockRecord r, String tid, String poRef) {
        var event = new InventoryDomainEvent.CostUpdated(
                UUID.randomUUID().toString(), "CostUpdated", 1, tid,
                "StockRecord", r.getStockRecordId(), Instant.now(),
                r.getSkuCode(), r.getFifoValuation(), r.getWeightedAvgCost(), poRef);
        eventPort.publish("CostUpdated", r.getStockRecordId(), event);
    }
}

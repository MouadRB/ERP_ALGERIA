package com.dz.erp.inventory.stock.Api;

import com.dz.erp.inventory.stock.application.dto.BulkMovementCommand;
import com.dz.erp.inventory.stock.application.dto.StockMovementResponse;
import com.dz.erp.inventory.stock.application.service.StockMovementService;
import com.dz.erp.inventory.stock.application.service.StockRecordService;
import com.dz.erp.inventory.stock.application.dto.AdjustStockCommand;
import com.dz.erp.inventory.stock.application.dto.ReceiveStockCommand;
import com.dz.erp.inventory.stock.domain.model.MovementType;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/inventory/v1/movements")
@RequiredArgsConstructor
public class StockMovementController {
    private final StockMovementService movementService;
    private final StockRecordService stockRecordService;

    @GetMapping("/by-stock-record/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<Page<StockMovementResponse>> findByStockRecord(@PathVariable String id, Pageable pageable) {
        return ApiResult.ok(movementService.findByStockRecordId(id, pageable), "movement.list");
    }

    @GetMapping("/audit-journal")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<Page<StockMovementResponse>> auditJournal(
            @RequestParam(required = false) MovementType type,
            Pageable pageable) {
        return ApiResult.ok(movementService.auditJournal(type, pageable), "movement.journal");
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<Void> bulkMovement(@Valid @RequestBody BulkMovementCommand cmd) {
        var movementType = MovementType.valueOf(cmd.movementType());
        for (var stockRecordId : cmd.stockRecordIds()) {
            switch (movementType) {
                case RECEPTION -> stockRecordService.receiveStock(stockRecordId, new ReceiveStockCommand(
                        stockRecordId, cmd.purchaseOrderRef(), cmd.supplierCode(),
                        cmd.quantity(), cmd.unitCost() != null ? cmd.unitCost() : BigDecimal.ZERO));
                case ADJUSTMENT_IN -> stockRecordService.adjustStock(stockRecordId,
                        new AdjustStockCommand(cmd.quantity(), cmd.reason() != null ? cmd.reason() : "Bulk adjustment"));
                case ADJUSTMENT_OUT -> stockRecordService.adjustStock(stockRecordId,
                        new AdjustStockCommand(-cmd.quantity(), cmd.reason() != null ? cmd.reason() : "Bulk adjustment"));
                default -> throw new IllegalArgumentException("Unsupported bulk movement type: " + movementType);
            }
        }
        return ApiResult.ok(null, "movement.bulk.completed");
    }
}

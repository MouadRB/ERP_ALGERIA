package com.dz.erp.inventory.stock.Api;

import com.dz.erp.inventory.stock.application.dto.*;
import com.dz.erp.inventory.stock.application.service.StockMovementService;
import com.dz.erp.inventory.stock.application.service.StockRecordService;
import com.dz.erp.inventory.stock.domain.model.StockStatus;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory/v1/stock-records")
@RequiredArgsConstructor
public class StockRecordController {
    private final StockRecordService stockRecordService;
    private final StockMovementService movementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER','WAREHOUSE_OPERATOR')")
    public ApiResult<Page<StockRecordResponse>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) StockStatus status,
            Pageable pageable) {
        return ApiResult.ok(stockRecordService.search(search, status, pageable), "stock.list");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER','WAREHOUSE_OPERATOR')")
    public ApiResult<StockRecordResponse> getById(@PathVariable String id) {
        return ApiResult.ok(stockRecordService.getById(id), "stock.found");
    }

    @GetMapping("/by-sku/{skuCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<StockRecordResponse> getBySkuCode(@PathVariable String skuCode) {
        return ApiResult.ok(stockRecordService.getBySkuCode(skuCode), "stock.found");
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<StockRecordResponse> receiveStock(@PathVariable String id,
                                                        @Valid @RequestBody ReceiveStockCommand cmd) {
        return ApiResult.ok(stockRecordService.receiveStock(id, cmd), "stock.received");
    }

    @PostMapping("/{id}/adjust")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<StockRecordResponse> adjustStock(@PathVariable String id,
                                                       @Valid @RequestBody AdjustStockCommand cmd) {
        return ApiResult.ok(stockRecordService.adjustStock(id, cmd), "stock.adjusted");
    }

    @PatchMapping("/{id}/threshold")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<StockRecordResponse> updateThreshold(@PathVariable String id,
                                                           @Valid @RequestBody UpdateThresholdCommand cmd) {
        return ApiResult.ok(stockRecordService.updateThresholds(id, cmd), "stock.threshold.updated");
    }

    @GetMapping("/{id}/evolution")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<StockEvolutionResponse> getEvolution(@PathVariable String id) {
        return ApiResult.ok(movementService.getEvolution(id), "stock.evolution");
    }
}

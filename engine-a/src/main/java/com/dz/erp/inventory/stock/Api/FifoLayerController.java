package com.dz.erp.inventory.stock.Api;

import com.dz.erp.inventory.stock.application.dto.FifoLayerResponse;
import com.dz.erp.inventory.stock.application.dto.FifoSummaryResponse;
import com.dz.erp.inventory.stock.application.service.FifoLayerService;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/inventory/v1/fifo-layers")
@RequiredArgsConstructor
public class FifoLayerController {
    private final FifoLayerService fifoLayerService;

    @GetMapping("/by-stock-record/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<FifoLayerResponse>> getLayersByStockRecord(@PathVariable String id) {
        return ApiResult.ok(fifoLayerService.getLayersByStockRecordId(id), "fifo.layers");
    }

    @GetMapping("/summary/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<FifoSummaryResponse> getSummary(@PathVariable String id) {
        return ApiResult.ok(fifoLayerService.getSummary(id), "fifo.summary");
    }
}

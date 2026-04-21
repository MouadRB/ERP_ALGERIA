package com.dz.erp.inventory.stock.application.service;

import com.dz.erp.inventory.stock.application.dto.StockDashboardResponse;
import com.dz.erp.inventory.stock.domain.model.StockStatus;
import com.dz.erp.inventory.stock.domain.port.StockMovementRepository;
import com.dz.erp.inventory.stock.domain.port.StockRecordRepository;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StockDashboardService {
    private final StockRecordRepository stockRecordRepo;
    private final StockMovementRepository movementRepo;
    private final InventoryCacheService cacheService;

    public StockDashboardResponse getDashboard() {
        var tid = AuthContext.currentTenantId();
        var cached = cacheService.getDashboard(tid);
        if (cached != null) return cached;

        var dashboard = new StockDashboardResponse(
                stockRecordRepo.sumFifoValuation(tid),
                (int) stockRecordRepo.countByStatus(StockStatus.OUT_OF_STOCK, tid),
                (int) stockRecordRepo.countByStatus(StockStatus.LOW_STOCK, tid),
                stockRecordRepo.sumSoftReserved(tid),
                stockRecordRepo.sumHardReserved(tid),
                movementRepo.countTodayByDirection(tid, true),
                movementRepo.countTodayByDirection(tid, false),
                (int) stockRecordRepo.count(tid)
        );
        cacheService.putDashboard(tid, dashboard);
        return dashboard;
    }
}

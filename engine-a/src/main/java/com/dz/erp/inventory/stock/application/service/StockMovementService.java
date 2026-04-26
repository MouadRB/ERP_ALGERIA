package com.dz.erp.inventory.stock.application.service;

import com.dz.erp.inventory.stock.application.dto.StockEvolutionResponse;
import com.dz.erp.inventory.stock.application.dto.StockMovementResponse;
import com.dz.erp.inventory.stock.domain.model.MovementType;
import com.dz.erp.inventory.stock.domain.port.StockMovementRepository;
import com.dz.erp.inventory.stock.infrastructure.mapper.StockMovementResponseMapper;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class StockMovementService {
    private final StockMovementRepository movementRepo;
    private final StockMovementResponseMapper responseMapper;

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> findByStockRecordId(String stockRecordId, Pageable pageable) {
        var tid = AuthContext.currentTenantId();
        return movementRepo.findByStockRecordId(stockRecordId, tid, pageable).map(responseMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> auditJournal(MovementType type, Pageable pageable) {
        var tid = AuthContext.currentTenantId();
        return movementRepo.findByTenant(tid, type, pageable).map(responseMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public StockEvolutionResponse getEvolution(String stockRecordId) {
        var tid = AuthContext.currentTenantId();
        // Get last 30 days of movements and reconstruct daily stock levels
        var movements = movementRepo.findByStockRecordId(stockRecordId, tid,
                org.springframework.data.domain.PageRequest.of(0, 1000));

        var dailyMap = new TreeMap<LocalDate, Integer>();
        var today = LocalDate.now();

        // Build daily quantities from movements (quantityAfter at each day)
        for (var mv : movements) {
            var date = mv.getPerformedAt().atZone(java.time.ZoneId.of("Africa/Algiers")).toLocalDate();
            if (date.isAfter(today.minusDays(30))) {
                dailyMap.put(date, mv.getQuantityAfter());
            }
        }

        // Fill in missing days with last known value
        var data = new ArrayList<StockEvolutionResponse.DailyStock>();
        int lastQty = 0;
        for (int i = 29; i >= 0; i--) {
            var date = today.minusDays(i);
            if (dailyMap.containsKey(date)) {
                lastQty = dailyMap.get(date);
            }
            data.add(new StockEvolutionResponse.DailyStock(date, lastQty));
        }

        int max = data.stream().mapToInt(StockEvolutionResponse.DailyStock::quantity).max().orElse(0);
        int min = data.stream().mapToInt(StockEvolutionResponse.DailyStock::quantity).min().orElse(0);
        BigDecimal avg = data.isEmpty() ? BigDecimal.ZERO :
                BigDecimal.valueOf(data.stream().mapToInt(StockEvolutionResponse.DailyStock::quantity).sum())
                        .divide(BigDecimal.valueOf(data.size()), 2, RoundingMode.HALF_UP);

        return new StockEvolutionResponse(data, max, min, avg);
    }
}

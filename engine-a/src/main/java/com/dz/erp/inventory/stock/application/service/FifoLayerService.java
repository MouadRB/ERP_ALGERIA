package com.dz.erp.inventory.stock.application.service;

import com.dz.erp.inventory.stock.application.dto.FifoLayerResponse;
import com.dz.erp.inventory.stock.application.dto.FifoSummaryResponse;
import com.dz.erp.inventory.stock.domain.model.FifoLayerStatus;
import com.dz.erp.inventory.stock.domain.port.FifoLayerRepository;
import com.dz.erp.inventory.stock.infrastructure.mapper.FifoLayerResponseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FifoLayerService {
    private final FifoLayerRepository fifoLayerRepo;
    private final FifoLayerResponseMapper responseMapper;

    @Transactional(readOnly = true)
    public List<FifoLayerResponse> getLayersByStockRecordId(String stockRecordId) {
        return fifoLayerRepo.findAllByStockRecordId(stockRecordId).stream()
                .map(responseMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public FifoSummaryResponse getSummary(String stockRecordId) {
        var allLayers = fifoLayerRepo.findAllByStockRecordId(stockRecordId);
        var activeLayers = allLayers.stream()
                .filter(l -> l.getStatus() == FifoLayerStatus.ACTIVE)
                .toList();

        int activeCount = activeLayers.size();
        int totalStock = activeLayers.stream().mapToInt(l -> l.getRemainingQuantity()).sum();
        BigDecimal totalValue = activeLayers.stream()
                .map(l -> l.getRemainingValue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal weightedAvg = totalStock > 0
                ? totalValue.divide(BigDecimal.valueOf(totalStock), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Next sale info from oldest active layer
        String nextSaleInfo = activeLayers.isEmpty() ? "No active layers" :
                activeLayers.getFirst().getRemainingQuantity() + " units from Layer #"
                        + activeLayers.getFirst().getLayerNumber()
                        + " (cost: " + activeLayers.getFirst().getUnitCost() + " DZD)";

        return new FifoSummaryResponse(activeCount, totalStock, weightedAvg, totalValue, nextSaleInfo);
    }
}

package com.dz.erp.inventory.stock.domain.port;

import com.dz.erp.inventory.stock.domain.model.MovementType;
import com.dz.erp.inventory.stock.domain.model.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface StockMovementRepository {
    StockMovement save(StockMovement movement);
    Optional<String> findLastHash(String stockRecordId);
    Page<StockMovement> findByStockRecordId(String stockRecordId, String tenantId, Pageable pageable);
    Page<StockMovement> findByTenant(String tenantId, MovementType type, Pageable pageable);
    int countTodayByDirection(String tenantId, boolean inbound);
}

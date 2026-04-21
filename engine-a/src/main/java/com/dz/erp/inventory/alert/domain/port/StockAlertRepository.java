package com.dz.erp.inventory.alert.domain.port;

import com.dz.erp.inventory.alert.domain.model.AlertType;
import com.dz.erp.inventory.alert.domain.model.StockAlert;

import java.util.List;
import java.util.Optional;

public interface StockAlertRepository {
    StockAlert save(StockAlert alert);
    Optional<StockAlert> findById(String alertId, String tenantId);
    List<StockAlert> findActive(String tenantId);
    boolean existsActiveByStockRecordIdAndType(String stockRecordId, AlertType type);
}

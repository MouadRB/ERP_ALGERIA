package com.dz.erp.inventory.stock.domain.port;

import com.dz.erp.inventory.stock.domain.model.StockRecord;
import com.dz.erp.inventory.stock.domain.model.StockStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface StockRecordRepository {
    StockRecord save(StockRecord record);
    Optional<StockRecord> findById(String stockRecordId, String tenantId);
    Optional<StockRecord> findBySkuCode(String skuCode, String tenantId);
    Optional<StockRecord> findByIdForUpdate(String stockRecordId, String tenantId);
    boolean existsBySkuCode(String skuCode, String tenantId);
    List<StockRecord> findAllBySkuCode(String skuCode, String tenantId);
    Page<StockRecord> search(String search, StockStatus status, String tenantId, Pageable pageable);
    int sumTotalQuantityBySkuCode(String skuCode, String tenantId);
    long countByStatus(StockStatus status, String tenantId);
    long count(String tenantId);
    BigDecimal sumFifoValuation(String tenantId);
    int sumSoftReserved(String tenantId);
    int sumHardReserved(String tenantId);
}

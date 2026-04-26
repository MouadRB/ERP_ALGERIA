package com.dz.erp.inventory.alert.infrastructure.scheduler;

import com.dz.erp.inventory.alert.domain.model.AlertSeverity;
import com.dz.erp.inventory.alert.domain.model.AlertType;
import com.dz.erp.inventory.alert.domain.model.StockAlert;
import com.dz.erp.inventory.alert.domain.port.StockAlertRepository;
import com.dz.erp.inventory.stock.domain.event.InventoryDomainEvent;
import com.dz.erp.inventory.stock.domain.model.StockStatus;
import com.dz.erp.inventory.alert.domain.port.AlertEventPort;
import com.dz.erp.inventory.stock.domain.port.StockRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockAlertJob {
    private final StockRecordRepository stockRecordRepo;
    private final StockAlertRepository alertRepo;
    private final AlertEventPort eventPort;

    @Scheduled(fixedDelayString = "${app.inventory.alert-check-ms:300000}")
    @Transactional
    public void checkStockLevels() {
        // Check OUT_OF_STOCK records
        var outOfStock = stockRecordRepo.search(null, StockStatus.OUT_OF_STOCK, null, PageRequest.of(0, 500));
        for (var record : outOfStock) {
            if (!alertRepo.existsActiveByStockRecordIdAndType(record.getStockRecordId(), AlertType.OUT_OF_STOCK)) {
                var alert = StockAlert.create(record.getTenantId(), record.getStockRecordId(), record.getSkuCode(),
                        AlertType.OUT_OF_STOCK, AlertSeverity.CRITICAL,
                        "SKU " + record.getSkuCode() + " is out of stock",
                        record.getReorderQuantity(), null, null);
                alertRepo.save(alert);
                log.info("Created OUT_OF_STOCK alert for SKU {}", record.getSkuCode());
            }
        }

        // Check LOW_STOCK (below threshold) records
        var lowStock = stockRecordRepo.search(null, StockStatus.LOW_STOCK, null, PageRequest.of(0, 500));
        for (var record : lowStock) {
            if (!alertRepo.existsActiveByStockRecordIdAndType(record.getStockRecordId(), AlertType.BELOW_THRESHOLD)) {
                var alert = StockAlert.create(record.getTenantId(), record.getStockRecordId(), record.getSkuCode(),
                        AlertType.BELOW_THRESHOLD, AlertSeverity.WARNING,
                        "SKU " + record.getSkuCode() + " below reorder threshold (" + record.getAvailable() + "/" + record.getReorderThreshold() + ")",
                        record.getReorderQuantity(), null, null);
                alertRepo.save(alert);

                // Publish ReorderTriggered event
                var event = new InventoryDomainEvent.ReorderTriggered(
                        UUID.randomUUID().toString(), "ReorderTriggered", 1, record.getTenantId(),
                        "StockRecord", record.getStockRecordId(), Instant.now(),
                        record.getSkuCode(), null, record.getReorderQuantity(),
                        record.getAvailable(), record.getReorderThreshold());
                eventPort.publish("ReorderTriggered", record.getStockRecordId(), event);

                log.info("Created BELOW_THRESHOLD alert for SKU {}, triggered reorder", record.getSkuCode());
            }
        }
    }
}

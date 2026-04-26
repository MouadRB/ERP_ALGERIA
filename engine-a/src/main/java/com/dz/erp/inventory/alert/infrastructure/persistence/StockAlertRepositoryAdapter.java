package com.dz.erp.inventory.alert.infrastructure.persistence;

import com.dz.erp.inventory.alert.domain.model.AlertType;
import com.dz.erp.inventory.alert.domain.model.StockAlert;
import com.dz.erp.inventory.alert.domain.port.StockAlertRepository;
import com.dz.erp.inventory.alert.infrastructure.mapper.StockAlertPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class StockAlertRepositoryAdapter implements StockAlertRepository {
    private final StockAlertSpringDataRepository jpa;
    private final StockAlertPersistenceMapper m;

    @Override
    public StockAlert save(StockAlert a) {
        return m.toDomain(jpa.save(m.toJpa(a)));
    }

    @Override
    public Optional<StockAlert> findById(String alertId, String tenantId) {
        return jpa.findByAlertIdAndTenantId(alertId, tenantId).map(m::toDomain);
    }

    @Override
    public List<StockAlert> findActive(String tenantId) {
        return jpa.findActive(tenantId).stream().map(m::toDomain).toList();
    }

    @Override
    public boolean existsActiveByStockRecordIdAndType(String stockRecordId, AlertType type) {
        return jpa.existsActiveByStockRecordIdAndType(stockRecordId, type.name());
    }
}

package com.dz.erp.inventory.stock.infrastructure.persistence;

import com.dz.erp.inventory.stock.domain.model.MovementType;
import com.dz.erp.inventory.stock.domain.model.StockMovement;
import com.dz.erp.inventory.stock.domain.port.StockMovementRepository;
import com.dz.erp.inventory.stock.infrastructure.mapper.StockMovementPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class StockMovementRepositoryAdapter implements StockMovementRepository {
    private final StockMovementSpringDataRepository jpa;
    private final StockMovementPersistenceMapper m;

    @Override
    public StockMovement save(StockMovement mv) {
        return m.toDomain(jpa.save(m.toJpa(mv)));
    }

    @Override
    public Optional<String> findLastHash(String stockRecordId) {
        return jpa.findLastHash(stockRecordId);
    }

    @Override
    public Page<StockMovement> findByStockRecordId(String stockRecordId, String tenantId, Pageable pageable) {
        return jpa.findByStockRecordIdAndTenantIdOrderByPerformedAtDesc(stockRecordId, tenantId, pageable)
                .map(m::toDomain);
    }

    @Override
    public Page<StockMovement> findByTenant(String tenantId, MovementType type, Pageable pageable) {
        return jpa.findByTenant(tenantId, type != null ? type.name() : null, pageable).map(m::toDomain);
    }

    @Override
    public int countTodayByDirection(String tenantId, boolean inbound) {
        return jpa.countTodayByDirection(tenantId, inbound);
    }
}

package com.dz.erp.inventory.stock.infrastructure.persistence;

import com.dz.erp.inventory.stock.domain.model.StockRecord;
import com.dz.erp.inventory.stock.domain.model.StockStatus;
import com.dz.erp.inventory.stock.domain.port.StockRecordRepository;
import com.dz.erp.inventory.stock.infrastructure.mapper.StockRecordPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class StockRecordRepositoryAdapter implements StockRecordRepository {
    private final StockRecordSpringDataRepository jpa;
    private final StockRecordPersistenceMapper m;

    @Override
    public StockRecord save(StockRecord r) {
        return m.toDomain(jpa.save(m.toJpa(r)));
    }

    @Override
    public Optional<StockRecord> findById(String id, String tid) {
        return jpa.findByStockRecordIdAndTenantId(id, tid).map(m::toDomain);
    }

    @Override
    public Optional<StockRecord> findBySkuCode(String skuCode, String tid) {
        return jpa.findBySkuCodeAndTenantId(skuCode, tid).map(m::toDomain);
    }

    @Override
    public Optional<StockRecord> findByIdForUpdate(String id, String tid) {
        return jpa.findByIdForUpdate(id, tid).map(m::toDomain);
    }

    @Override
    public boolean existsBySkuCode(String skuCode, String tid) {
        return jpa.existsBySkuCodeAndTenantId(skuCode, tid);
    }

    @Override
    public List<StockRecord> findAllBySkuCode(String skuCode, String tid) {
        return jpa.findAllBySkuCodeAndTenantId(skuCode, tid).stream().map(m::toDomain).toList();
    }

    @Override
    public Page<StockRecord> search(String search, StockStatus status, String tid, Pageable pageable) {
        return jpa.search(search, status, tid, pageable).map(m::toDomain);
    }

    @Override
    public int sumTotalQuantityBySkuCode(String skuCode, String tid) {
        return jpa.sumTotalQuantityBySkuCode(skuCode, tid);
    }

    @Override
    public long countByStatus(StockStatus status, String tid) {
        return jpa.countByStatusAndTenantId(status, tid);
    }

    @Override
    public long count(String tid) {
        return jpa.countByTenantId(tid);
    }

    @Override
    public BigDecimal sumFifoValuation(String tid) {
        return jpa.sumFifoValuation(tid);
    }

    @Override
    public int sumSoftReserved(String tid) {
        return jpa.sumSoftReserved(tid);
    }

    @Override
    public int sumHardReserved(String tid) {
        return jpa.sumHardReserved(tid);
    }
}

package com.dz.erp.inventory.stock.infrastructure.persistence;

import com.dz.erp.inventory.stock.domain.model.FifoLayer;
import com.dz.erp.inventory.stock.domain.port.FifoLayerRepository;
import com.dz.erp.inventory.stock.infrastructure.mapper.FifoLayerPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class FifoLayerRepositoryAdapter implements FifoLayerRepository {
    private final FifoLayerSpringDataRepository jpa;
    private final FifoLayerPersistenceMapper m;

    @Override
    public FifoLayer save(FifoLayer l) {
        return m.toDomain(jpa.save(m.toJpa(l)));
    }

    @Override
    public List<FifoLayer> findActiveOrderedByLayerNumber(String stockRecordId) {
        return jpa.findActiveOrderedByLayerNumber(stockRecordId).stream().map(m::toDomain).toList();
    }

    @Override
    public List<FifoLayer> findAllByStockRecordId(String stockRecordId) {
        return jpa.findAllByStockRecordIdOrderByLayerNumberAsc(stockRecordId).stream().map(m::toDomain).toList();
    }

    @Override
    public int nextLayerNumber(String stockRecordId) {
        return jpa.nextLayerNumber(stockRecordId);
    }
}

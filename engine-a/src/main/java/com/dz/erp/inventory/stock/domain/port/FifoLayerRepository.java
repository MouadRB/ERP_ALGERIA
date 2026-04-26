package com.dz.erp.inventory.stock.domain.port;

import com.dz.erp.inventory.stock.domain.model.FifoLayer;

import java.util.List;

public interface FifoLayerRepository {
    FifoLayer save(FifoLayer layer);
    List<FifoLayer> findActiveOrderedByLayerNumber(String stockRecordId);
    List<FifoLayer> findAllByStockRecordId(String stockRecordId);
    int nextLayerNumber(String stockRecordId);
}

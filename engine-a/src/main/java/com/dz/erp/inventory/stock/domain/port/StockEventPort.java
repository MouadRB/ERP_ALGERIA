package com.dz.erp.inventory.stock.domain.port;

public interface StockEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

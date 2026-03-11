package com.dz.erp.mdm.warehouse.domain.port;

public interface BinEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

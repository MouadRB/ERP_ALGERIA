package com.dz.erp.oms.integration.domain.port;

public interface ShipmentEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

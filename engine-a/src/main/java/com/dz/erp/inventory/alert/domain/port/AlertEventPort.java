package com.dz.erp.inventory.alert.domain.port;

public interface AlertEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

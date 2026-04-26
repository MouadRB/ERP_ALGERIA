package com.dz.erp.inventory.returns.domain.port;

public interface ReturnEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

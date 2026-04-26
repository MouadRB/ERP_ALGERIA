package com.dz.erp.oms.returns.domain.port;

public interface ReturnEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

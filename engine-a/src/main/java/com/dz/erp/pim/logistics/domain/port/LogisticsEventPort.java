package com.dz.erp.pim.logistics.domain.port;

public interface LogisticsEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

package com.dz.erp.mdm.sku.domain.port;

public interface SkuEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

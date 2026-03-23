package com.dz.erp.pim.product.domain.port;

public interface ProductEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

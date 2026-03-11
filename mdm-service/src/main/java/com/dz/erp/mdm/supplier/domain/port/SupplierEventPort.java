package com.dz.erp.mdm.supplier.domain.port;

public interface SupplierEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

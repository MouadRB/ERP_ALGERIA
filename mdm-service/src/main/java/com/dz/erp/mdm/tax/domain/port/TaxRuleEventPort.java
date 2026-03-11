package com.dz.erp.mdm.tax.domain.port;
public interface TaxRuleEventPort {
    void publish(String eventType, String aggregateId, Object event);
}

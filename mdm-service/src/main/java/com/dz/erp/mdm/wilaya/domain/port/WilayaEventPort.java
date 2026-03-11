package com.dz.erp.mdm.wilaya.domain.port;
public interface WilayaEventPort { void publish(String eventType, String aggregateId, Object event); }

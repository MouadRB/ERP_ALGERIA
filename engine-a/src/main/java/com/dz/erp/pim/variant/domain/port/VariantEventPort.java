package com.dz.erp.pim.variant.domain.port;

public interface VariantEventPort {
    void publish(String et, String ai, Object ev);
}

package com.dz.erp.pim.logistics.domain.port;

import com.dz.erp.pim.logistics.domain.model.WilayaRestriction;

import java.util.List;

public interface WilayaRestrictionRepository {
    WilayaRestriction save(WilayaRestriction restriction);
    List<WilayaRestriction> findByProductId(String productId, String tenantId);
    boolean exists(String productId, String wilayaCode, String tenantId);
    void delete(String productId, String wilayaCode, String tenantId);
    void deleteAllByProductId(String productId, String tenantId);

}

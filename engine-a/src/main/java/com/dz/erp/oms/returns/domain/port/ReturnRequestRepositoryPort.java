package com.dz.erp.oms.returns.domain.port;

import com.dz.erp.oms.returns.domain.model.ReturnRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReturnRequestRepositoryPort {

    ReturnRequest save(ReturnRequest request);

    Optional<ReturnRequest> findById(String tenantId, UUID returnId);

    List<ReturnRequest> findByOrderId(String tenantId, UUID orderId);
}

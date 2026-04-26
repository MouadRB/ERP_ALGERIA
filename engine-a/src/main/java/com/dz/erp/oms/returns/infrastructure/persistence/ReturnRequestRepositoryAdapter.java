package com.dz.erp.oms.returns.infrastructure.persistence;

import com.dz.erp.oms.returns.domain.model.ReturnRequest;
import com.dz.erp.oms.returns.domain.port.ReturnRequestRepositoryPort;
import com.dz.erp.oms.returns.infrastructure.mapper.ReturnRequestPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ReturnRequestRepositoryAdapter implements ReturnRequestRepositoryPort {

    private final ReturnRequestSpringDataRepository repo;
    private final ReturnRequestPersistenceMapper mapper;

    @Override
    public ReturnRequest save(ReturnRequest request) {
        var existing = repo.findById(request.getReturnId()).orElse(null);
        var merged = mapper.toJpa(request, existing);
        return mapper.toDomain(repo.save(merged));
    }

    @Override
    public Optional<ReturnRequest> findById(String tenantId, UUID returnId) {
        return repo.findByReturnIdAndTenantId(returnId, tenantId).map(mapper::toDomain);
    }

    @Override
    public List<ReturnRequest> findByOrderId(String tenantId, UUID orderId) {
        return repo.findByOrderIdAndTenantId(orderId, tenantId).stream()
                .map(mapper::toDomain).toList();
    }
}

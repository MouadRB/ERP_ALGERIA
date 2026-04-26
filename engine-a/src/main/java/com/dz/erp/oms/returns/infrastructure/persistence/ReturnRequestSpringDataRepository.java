package com.dz.erp.oms.returns.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReturnRequestSpringDataRepository extends JpaRepository<ReturnRequestJpaEntity, UUID> {

    Optional<ReturnRequestJpaEntity> findByReturnIdAndTenantId(UUID returnId, String tenantId);

    List<ReturnRequestJpaEntity> findByOrderIdAndTenantId(UUID orderId, String tenantId);
}

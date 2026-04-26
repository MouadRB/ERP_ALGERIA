package com.dz.erp.catalog.channel.infrastructure.persistence;

import com.dz.erp.catalog.shared.domain.ChannelType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SalesChannelSpringDataRepository extends JpaRepository<SalesChannelJpaEntity, UUID> {

    Optional<SalesChannelJpaEntity> findByChannelTypeAndTenantId(ChannelType type, String tenantId);

    List<SalesChannelJpaEntity> findByTenantId(String tenantId);

    List<SalesChannelJpaEntity> findByIsActiveTrueAndTenantId(String tenantId);

    /** Returns distinct tenant IDs that have an active channel of the given type. */
    @Query("SELECT DISTINCT sc.tenantId FROM SalesChannelJpaEntity sc " +
           "WHERE sc.channelType = :type AND sc.isActive = true")
    List<String> findTenantIdsWithActiveChannel(@Param("type") ChannelType type);

    @Query("SELECT DISTINCT sc.tenantId FROM SalesChannelJpaEntity sc")
    List<String> findAllTenantIds();
}

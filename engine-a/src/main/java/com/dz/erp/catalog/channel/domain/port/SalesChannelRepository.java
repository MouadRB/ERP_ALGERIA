package com.dz.erp.catalog.channel.domain.port;

import com.dz.erp.catalog.channel.domain.model.SalesChannel;
import com.dz.erp.catalog.shared.domain.ChannelType;

import java.util.List;
import java.util.Optional;

/**
 * Domain port for SalesChannel persistence.
 * No Spring annotations — implemented by SalesChannelRepositoryAdapter.
 */
public interface SalesChannelRepository {

    Optional<SalesChannel> findByChannelTypeAndTenantId(ChannelType type, String tenantId);

    List<SalesChannel> findAllActiveByTenantId(String tenantId);

    List<SalesChannel> findAllByTenantId(String tenantId);

    /** Returns all tenant IDs that have an active channel of the given type. */
    List<String> findTenantIdsWithActiveChannel(ChannelType type);

    /** Returns all distinct tenant IDs across all channels. */
    List<String> findAllTenantIds();

    SalesChannel save(SalesChannel channel);
}

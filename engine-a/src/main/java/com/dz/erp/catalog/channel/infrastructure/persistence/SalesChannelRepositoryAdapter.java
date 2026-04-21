package com.dz.erp.catalog.channel.infrastructure.persistence;

import com.dz.erp.catalog.channel.domain.model.SalesChannel;
import com.dz.erp.catalog.channel.domain.port.SalesChannelRepository;
import com.dz.erp.catalog.channel.infrastructure.mapper.SalesChannelPersistenceMapper;
import com.dz.erp.catalog.shared.domain.ChannelType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SalesChannelRepositoryAdapter implements SalesChannelRepository {

    private final SalesChannelSpringDataRepository jpa;
    private final SalesChannelPersistenceMapper mapper;

    @Override
    public Optional<SalesChannel> findByChannelTypeAndTenantId(ChannelType type, String tenantId) {
        return jpa.findByChannelTypeAndTenantId(type, tenantId).map(mapper::toDomain);
    }

    @Override
    public List<SalesChannel> findAllActiveByTenantId(String tenantId) {
        return jpa.findByIsActiveTrueAndTenantId(tenantId).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public List<SalesChannel> findAllByTenantId(String tenantId) {
        return jpa.findByTenantId(tenantId).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public List<String> findTenantIdsWithActiveChannel(ChannelType type) {
        return jpa.findTenantIdsWithActiveChannel(type);
    }

    @Override
    public List<String> findAllTenantIds() {
        return jpa.findAllTenantIds();
    }

    @Override
    public SalesChannel save(SalesChannel channel) {
        return mapper.toDomain(jpa.save(mapper.toJpa(channel)));
    }
}

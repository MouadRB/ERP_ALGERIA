package com.dz.erp.catalog.channel.application;

import com.dz.erp.catalog.channel.application.dto.SalesChannelResponse;
import com.dz.erp.catalog.channel.application.dto.UpdateChannelRulesCommand;
import com.dz.erp.catalog.channel.domain.event.ChannelDomainEvent;
import com.dz.erp.catalog.channel.domain.model.SalesChannel;
import com.dz.erp.catalog.channel.domain.model.SalesChannelRules;
import com.dz.erp.catalog.channel.domain.port.ChannelEventPort;
import com.dz.erp.catalog.channel.domain.port.SalesChannelRepository;
import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import com.dz.erp.catalog.search.shared.port.CatalogCachePort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesChannelService {

    private final SalesChannelRepository channelRepo;
    private final CatalogProductRepository productRepo;
    private final ChannelEventPort channelEventPort;
    private final CatalogCachePort cachePort;

    @Transactional(readOnly = true)
    public List<SalesChannelResponse> getAllChannels() {
        var tenantId = AuthContext.currentTenantId();
        return channelRepo.findAllByTenantId(tenantId).stream()
                .map(ch -> toResponse(ch, tenantId))
                .toList();
    }

    @Transactional(readOnly = true)
    public SalesChannelResponse getChannelStats(ChannelType type) {
        var tenantId = AuthContext.currentTenantId();
        var channel = channelRepo.findByChannelTypeAndTenantId(type, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND, type.name()));
        return toResponse(channel, tenantId);
    }

    @Transactional
    public SalesChannelResponse updateChannelRules(UpdateChannelRulesCommand cmd) {
        var tenantId = AuthContext.currentTenantId();
        var actorId = AuthContext.currentUserId();

        var channel = channelRepo.findByChannelTypeAndTenantId(cmd.channelType(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND, cmd.channelType().name()));

        var previousRules = channel.getRules();
        var newRules = new SalesChannelRules(
                cmd.autoMaskOnZeroStock(), cmd.autoRepublishOnStock(),
                cmd.excludeZeroPrice(), cmd.excludeNegativeStock(),
                cmd.excludeOcrDraft(), cmd.excludeVariantsIndividual(),
                cmd.minPriceDzd(), cmd.maxPriceDzd()
        );

        channel.updateRules(newRules, actorId);
        channelRepo.save(channel);

        channelEventPort.publish("CHANNEL_RULES_UPDATED", cmd.channelType().name(),
                new ChannelDomainEvent.ChannelRulesUpdated(cmd.channelType(), previousRules, newRules, actorId, tenantId));

        cachePort.evictByPattern("catalog:stats:*");
        cachePort.evictByPattern("catalog:products:" + cmd.channelType().name() + ":*");

        return toResponse(channel, tenantId);
    }

    @Transactional
    public SalesChannelResponse activateChannel(ChannelType type) {
        var tenantId = AuthContext.currentTenantId();
        var actorId = AuthContext.currentUserId();

        var channel = channelRepo.findByChannelTypeAndTenantId(type, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND, type.name()));

        channel.activate(actorId);
        channelRepo.save(channel);

        channelEventPort.publish("CHANNEL_ACTIVATED", type.name(),
                new ChannelDomainEvent.ChannelActivated(type, actorId, tenantId));

        return toResponse(channel, tenantId);
    }

    @Transactional
    public SalesChannelResponse deactivateChannel(ChannelType type) {
        var tenantId = AuthContext.currentTenantId();
        var actorId = AuthContext.currentUserId();

        var channel = channelRepo.findByChannelTypeAndTenantId(type, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND, type.name()));

        channel.deactivate(actorId);
        channelRepo.save(channel);

        channelEventPort.publish("CHANNEL_DEACTIVATED", type.name(),
                new ChannelDomainEvent.ChannelDeactivated(type, actorId, tenantId));

        return toResponse(channel, tenantId);
    }

    private SalesChannelResponse toResponse(SalesChannel channel, String tenantId) {
        var channelType = channel.getChannelType();

        long published = productRepo.findPublishedByChannelAndTenantId(channelType, tenantId).size();

        var maskedAuto = productRepo.findAllByStatusAndTenantId(PublicationStatus.MASKED_AUTO, tenantId);
        var maskedManual = productRepo.findAllByStatusAndTenantId(PublicationStatus.MASKED_MANUAL, tenantId);
        long masked = java.util.stream.Stream.concat(maskedAuto.stream(), maskedManual.stream())
                .filter(p -> p.getActiveChannels().contains(channelType))
                .count();
        long scheduled = productRepo.findAllByStatusAndTenantId(PublicationStatus.SCHEDULED, tenantId).stream()
                .filter(p -> p.getActiveChannels().contains(channelType))
                .count();

        return new SalesChannelResponse(
                channel.getId(), channelType, channel.isActive(), channel.getRules(),
                channel.getSyncFrequencyMinutes(), channel.getCatalogId(),
                channel.getLastSyncAt(), published, masked, scheduled
        );
    }
}

package com.dz.erp.catalog.channel.domain.port;

import com.dz.erp.catalog.channel.domain.event.ChannelDomainEvent;

/**
 * Domain port for publishing SalesChannel events.
 * Same pattern as PIM's ProductEventPort.
 */
public interface ChannelEventPort {

    void publish(String eventType, String aggregateId, ChannelDomainEvent event);
}

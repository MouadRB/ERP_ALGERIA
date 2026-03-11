package com.dz.erp.shared.outbox;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class OutboxPoller {

    private final OutboxJpaRepository repository;
    private final OutboxProperties properties;
    private final Map<String, OutboxProperties.Target> targetsByName;
    private final RestClient restClient;

    public OutboxPoller(OutboxJpaRepository repository, OutboxProperties properties) {
        this.repository = repository;
        this.properties = properties;
        this.targetsByName = properties.getTargets().stream()
                .collect(Collectors.toMap(OutboxProperties.Target::getName, t -> t));
        this.restClient = RestClient.builder()
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
        log.info("Outbox poller: {} targets", targetsByName.size());
    }

    @Scheduled(fixedDelayString = "${app.outbox.poll-interval-ms:1000}")
    public void pollAndDeliver() {
        var events = repository.findPending(Instant.now(), properties.getBatchSize());
        if (events.isEmpty()) return;

        for (var event : events) {
            deliverEvent(event);
        }
    }

    @Transactional
    public void deliverEvent(OutboxEventEntity event) {
        var target = targetsByName.get(event.getTargetName());
        if (target == null) {
            event.markFailed("No target config: " + event.getTargetName(), properties.getRetryMax());
            repository.save(event);
            return;
        }

        String url = target.urlFor(event.getEventType());
        if (url == null) {
            event.markFailed("No route: " + event.getEventType(), properties.getRetryMax());
            repository.save(event);
            return;
        }

        try {
            restClient.post().uri(url)
                    .body(Map.of(
                            "eventId", event.getEventId().toString(),
                            "aggregateType", event.getAggregateType(),
                            "aggregateId", event.getAggregateId(),
                            "eventType", event.getEventType(),
                            "eventVersion", event.getEventVersion(),
                            "tenantId", event.getTenantId(),
                            "payload", event.getPayload(),
                            "createdAt", event.getCreatedAt().toString()
                    ))
                    .retrieve().toBodilessEntity();

            event.markSent();
            log.info("Delivered [{}] → {} ({})", event.getEventType(), event.getTargetName(), url);
        } catch (Exception ex) {
            event.markFailed(ex.getMessage(), properties.getRetryMax());
            log.warn("Failed [{}] → {} (attempt {}/{})", event.getEventType(),
                    event.getTargetName(), event.getRetryCount(), properties.getRetryMax());
        }

        repository.save(event);
    }
}

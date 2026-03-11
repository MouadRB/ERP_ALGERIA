package com.dz.erp.shared.outbox;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxRetentionJob {
    private final OutboxJpaRepository repository;

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanSentEvents() {
        var cutoff = Instant.now().minus(30, ChronoUnit.DAYS);
        int deleted = repository.deleteSentBefore(cutoff);
        if (deleted > 0) log.info("Outbox retention: deleted {} SENT events older than 30 days", deleted);
    }
}

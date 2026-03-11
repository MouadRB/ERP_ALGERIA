package com.dz.erp.shared.outbox;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface OutboxJpaRepository extends JpaRepository<OutboxEventEntity, UUID> {

    @Query("SELECT e FROM OutboxEventEntity e WHERE e.status IN (com.dz.erp.shared.outbox.OutboxStatus.NEW, com.dz.erp.shared.outbox.OutboxStatus.FAILED) " +
            "AND e.nextRetryAt <= :now ORDER BY e.createdAt ASC LIMIT :batch")
    List<OutboxEventEntity> findPending(@Param("now") Instant now, @Param("batch") int batch);

    List<OutboxEventEntity> findByStatus(OutboxStatus status);

    @Query("SELECT e.status, COUNT(e) FROM OutboxEventEntity e GROUP BY e.status")
    List<Object[]> countByStatus();

    @Modifying
    @Query("DELETE FROM OutboxEventEntity e WHERE e.status = com.dz.erp.shared.outbox.OutboxStatus.SENT AND e.publishedAt < :cutoff")
    int deleteSentBefore(@Param("cutoff") Instant cutoff);
}

package com.dz.erp.pim.audit.application;

import com.dz.erp.pim.audit.domain.model.AuditEntry;
import com.dz.erp.pim.audit.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditSpringDataRepository repo;

    @Transactional
    public void record(String productId, String tenantId, String action, String description, String actorId, String actorName) {
        var lastHash = repo.findTopByProductIdOrderByOccurredAtDesc(productId).map(AuditEntryJpaEntity::getCurrentHash).orElse(null);
        var entry = new AuditEntry(productId, tenantId, action, description, actorId, actorName, lastHash);
        var e = new AuditEntryJpaEntity();
        e.setAuditId(entry.getAuditId());
        e.setProductId(productId);
        e.setTenantId(tenantId);
        e.setAction(action);
        e.setDescription(description);
        e.setActorId(actorId);
        e.setActorName(actorName);
        e.setOccurredAt(entry.getOccurredAt());
        e.setPreviousHash(entry.getPreviousHash());
        e.setCurrentHash(entry.getCurrentHash());
        repo.save(e);
    }

    @Transactional(readOnly = true)
    public List<AuditEntryJpaEntity> getHistory(String productId) {
        return repo.findByProductIdOrderByOccurredAtDesc(productId);
    }
}

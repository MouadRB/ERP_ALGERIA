package com.dz.erp.pim.audit.infrastructure.persistence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; import java.util.Optional;
public interface AuditSpringDataRepository extends JpaRepository<AuditEntryJpaEntity, String> {
    List<AuditEntryJpaEntity> findByProductIdOrderByOccurredAtDesc(String productId);
    Optional<AuditEntryJpaEntity> findTopByProductIdOrderByOccurredAtDesc(String productId);
}

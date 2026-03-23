package com.dz.erp.shared.notification.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationSpringDataRepository extends JpaRepository<NotificationJpaEntity, String> {

    Page<NotificationJpaEntity> findByTenantIdAndTargetRoleInAndReadOrderByOccurredAtDesc(
            String tenantId, java.util.Collection<String> roles, boolean read, Pageable pageable);

    Page<NotificationJpaEntity> findByTenantIdAndTargetRoleInOrderByOccurredAtDesc(
            String tenantId, java.util.Collection<String> roles, Pageable pageable);

    long countByTenantIdAndTargetRoleInAndRead(String tenantId, java.util.Collection<String> roles, boolean read);

    @Modifying
    @Query("UPDATE NotificationJpaEntity n SET n.read = true WHERE n.tenantId = :tid AND n.targetRole IN :roles AND n.read = false")
    void markAllRead(@Param("tid") String tenantId, @Param("roles") java.util.Collection<String> roles);
}

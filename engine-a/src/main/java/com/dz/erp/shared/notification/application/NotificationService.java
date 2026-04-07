package com.dz.erp.shared.notification.application;

import com.dz.erp.shared.notification.application.dto.*;
import com.dz.erp.shared.notification.domain.model.Notification;
import com.dz.erp.shared.notification.infrastructure.persistence.*;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationSpringDataRepository repo;

    @Transactional

    public void create(NotificationCreateCommand cmd) {
        var n = new Notification(cmd.tenantId(), cmd.targetRole(), cmd.module(), cmd.eventType(),
                cmd.titleKey(), cmd.bodyKey(), cmd.params(), cmd.referenceId(), cmd.referenceType());
        var e = new NotificationJpaEntity();
        e.setNotificationId(n.getNotificationId());
        e.setTenantId(n.getTenantId());
        e.setTargetRole(n.getTargetRole());
        e.setModule(n.getModule());
        e.setEventType(n.getEventType());
        e.setTitleKey(n.getTitleKey());
        e.setBodyKey(n.getBodyKey());
        e.setParams(n.getParams());
        e.setReferenceId(n.getReferenceId());
        e.setReferenceType(n.getReferenceType());
        e.setRead(false);
        e.setOccurredAt(n.getOccurredAt());
        repo.save(e);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getForCurrentUser(Boolean unread, int page, int size) {
        var tid = AuthContext.currentTenantId();
        var roles = AuthContext.currentUser().roles();
        var pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());
        Page<NotificationJpaEntity> result;
        if (Boolean.TRUE.equals(unread)) {
            result = repo.findByTenantIdAndTargetRoleInAndReadOrderByOccurredAtDesc(tid, roles, false, pageable);
        } else {
            result = repo.findByTenantIdAndTargetRoleInOrderByOccurredAtDesc(tid, roles, pageable);
        }
        return result.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse countUnread() {
        var tid = AuthContext.currentTenantId();
        var roles = AuthContext.currentUser().roles();
        return new UnreadCountResponse(repo.countByTenantIdAndTargetRoleInAndRead(tid, roles, false));
    }

    @Transactional
    public void markRead(String notificationId) {
        repo.findById(notificationId).ifPresent(e -> {
            e.setRead(true);
            repo.save(e);
        });
    }

    @Transactional
    public void markAllRead() {
        var tid = AuthContext.currentTenantId();
        var roles = AuthContext.currentUser().roles();
        repo.markAllRead(tid, roles);
    }

    private NotificationResponse toResponse(NotificationJpaEntity e) {
        return new NotificationResponse(e.getNotificationId(), e.getModule(), e.getEventType(),
                e.getTitleKey(), e.getBodyKey(), e.getParams(), e.getReferenceId(), e.getReferenceType(),
                e.isRead(), e.getOccurredAt());
    }
}

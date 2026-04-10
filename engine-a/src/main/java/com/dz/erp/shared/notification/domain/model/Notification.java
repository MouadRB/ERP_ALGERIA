package com.dz.erp.shared.notification.domain.model;

import lombok.Getter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
public class Notification {
    private final String notificationId;
    private final String tenantId;
    private final String targetRole;
    private final String module;
    private final String eventType;
    private final String titleKey;
    private final String bodyKey;
    private final Map<String, String> params;
    private final String referenceId;
    private final String referenceType;
    private boolean read;
    private final Instant occurredAt;

    public Notification(String tenantId, String targetRole, String module, String eventType,
                        String titleKey, String bodyKey, Map<String, String> params,
                        String referenceId, String referenceType) {
        this.notificationId = UUID.randomUUID().toString();
        this.tenantId = tenantId;
        this.targetRole = targetRole;
        this.module = module;
        this.eventType = eventType;
        this.titleKey = titleKey;
        this.bodyKey = bodyKey;
        this.params = params;
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.read = false;
        this.occurredAt = Instant.now();
    }


}

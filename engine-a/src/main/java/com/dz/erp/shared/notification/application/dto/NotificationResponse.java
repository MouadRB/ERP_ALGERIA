package com.dz.erp.shared.notification.application.dto;

import java.time.Instant;
import java.util.Map;

public record NotificationResponse(String notificationId, String module, String eventType,
    String titleKey, String bodyKey, Map<String, String> params,
    String referenceId, String referenceType, boolean read, Instant occurredAt) {}

package com.dz.erp.shared.notification.application.dto;

import lombok.Builder;
import java.util.Map;

@Builder
public record NotificationCreateCommand(String tenantId, String targetRole, String module,
    String eventType, String titleKey, String bodyKey, Map<String, String> params,
    String referenceId, String referenceType) {}

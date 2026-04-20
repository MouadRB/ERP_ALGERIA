package com.dz.erp.catalog.channel.application.dto;

import java.time.LocalDateTime;

/**
 * Current WhatsApp sync status — displayed in the Canaux de Vente UI.
 */
public record SyncStatusResponse(
        LocalDateTime lastSyncAt,
        int productsSynced,
        int errorsLastRun,
        LocalDateTime nextSyncAt
) {}

package com.dz.erp.catalog.channel.application.dto;

/**
 * Result of a WhatsApp sync operation.
 */
public record SyncJobResponse(
        int syncedCount,
        int excludedCount,
        int errorCount,
        long durationMs
) {}

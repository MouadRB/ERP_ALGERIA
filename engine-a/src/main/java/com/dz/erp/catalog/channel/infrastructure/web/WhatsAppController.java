package com.dz.erp.catalog.channel.infrastructure.web;

import com.dz.erp.catalog.channel.application.WhatsAppSyncService;
import com.dz.erp.catalog.channel.application.dto.SyncJobResponse;
import com.dz.erp.catalog.channel.application.dto.SyncStatusResponse;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for WhatsApp Business catalog sync.
 *
 * POST /catalog/v1/channels/whatsapp/sync          → trigger manual sync (CATALOG_ADMIN)
 * GET  /catalog/v1/channels/whatsapp/sync/status    → current sync status
 */
@RestController
@RequestMapping("/catalog/v1/channels/whatsapp")
@RequiredArgsConstructor
public class WhatsAppController {

    private final WhatsAppSyncService syncService;

    @PostMapping("/sync")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ApiResult<SyncJobResponse> triggerSync() {
        return ApiResult.ok(
                syncService.triggerSync(AuthContext.currentTenantId()),
                "whatsapp.sync.triggered");
    }

    @GetMapping("/sync/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER')")
    public ApiResult<SyncStatusResponse> getSyncStatus() {
        return ApiResult.ok(syncService.getSyncStatus(AuthContext.currentTenantId()));
    }
}

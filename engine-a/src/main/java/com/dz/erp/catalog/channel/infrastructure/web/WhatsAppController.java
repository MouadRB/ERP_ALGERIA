package com.dz.erp.catalog.channel.infrastructure.web;

import com.dz.erp.catalog.channel.application.WhatsAppSyncService;
import com.dz.erp.catalog.channel.application.dto.SyncJobResponse;
import com.dz.erp.catalog.channel.application.dto.SyncStatusResponse;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.AuthContext;
import com.dz.erp.shared.security.Roles;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for WhatsApp Business catalog sync.
 */
@RestController
@RequestMapping("/catalog/v1/channels/whatsapp")
@RequiredArgsConstructor
public class WhatsAppController {

    private final WhatsAppSyncService syncService;

    @PostMapping("/sync")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<SyncJobResponse> triggerSync() {
        return ApiResult.ok(
                syncService.triggerSync(AuthContext.currentTenantId()),
                "whatsapp.sync.triggered");
    }

    @GetMapping("/sync/status")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<SyncStatusResponse> getSyncStatus() {
        return ApiResult.ok(syncService.getSyncStatus(AuthContext.currentTenantId()));
    }
}

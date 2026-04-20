package com.dz.erp.catalog.channel.infrastructure.web;

import com.dz.erp.catalog.channel.application.SalesChannelService;
import com.dz.erp.catalog.channel.application.dto.SalesChannelResponse;
import com.dz.erp.catalog.channel.application.dto.UpdateChannelRulesCommand;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for SalesChannel management.
 * <p>
 * GET   /catalog/v1/channels                  → all channels with per-channel stats
 * GET   /catalog/v1/channels/{type}           → single channel stats
 * PUT   /catalog/v1/channels/{type}/rules     → update global channel rules
 * PATCH /catalog/v1/channels/{type}/activate  → activate channel
 * PATCH /catalog/v1/channels/{type}/deactivate→ deactivate channel
 */
@RestController
@RequestMapping("/catalog/v1/channels")
@RequiredArgsConstructor
public class SalesChannelController {

    private final SalesChannelService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER','FINANCE_MANAGER')")
    public ApiResult<List<SalesChannelResponse>> getAllChannels() {
        return ApiResult.ok(service.getAllChannels());
    }

    @GetMapping("/{type}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER','FINANCE_MANAGER')")
    public ApiResult<SalesChannelResponse> getChannelStats(@PathVariable ChannelType type) {
        return ApiResult.ok(service.getChannelStats(type));
    }

    @PutMapping("/{type}/rules")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ApiResult<SalesChannelResponse> updateChannelRules(
            @PathVariable ChannelType type,
            @Valid @RequestBody UpdateChannelRulesCommand cmd) {
        // Ensure path variable matches command body
        if (cmd.channelType() != type) {
            return ApiResult.error("channel.type.mismatch");
        }
        return ApiResult.ok(service.updateChannelRules(cmd), "channel.rules.updated");
    }

    @PatchMapping("/{type}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ApiResult<SalesChannelResponse> activate(@PathVariable ChannelType type) {
        return ApiResult.ok(service.activateChannel(type), "channel.activated");
    }

    @PatchMapping("/{type}/deactivate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ApiResult<SalesChannelResponse> deactivate(@PathVariable ChannelType type) {
        return ApiResult.ok(service.deactivateChannel(type), "channel.deactivated");
    }
}

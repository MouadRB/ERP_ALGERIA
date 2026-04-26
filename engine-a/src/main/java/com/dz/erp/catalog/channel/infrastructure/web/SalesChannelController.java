package com.dz.erp.catalog.channel.infrastructure.web;

import com.dz.erp.catalog.channel.application.SalesChannelService;
import com.dz.erp.catalog.channel.application.dto.SalesChannelResponse;
import com.dz.erp.catalog.channel.application.dto.UpdateChannelRulesCommand;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for SalesChannel management.
 */
@RestController
@RequestMapping("/catalog/v1/channels")
@RequiredArgsConstructor
public class SalesChannelController {

    private final SalesChannelService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<SalesChannelResponse>> getAllChannels() {
        return ApiResult.ok(service.getAllChannels());
    }

    @GetMapping("/{type}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<SalesChannelResponse> getChannelStats(@PathVariable ChannelType type) {
        return ApiResult.ok(service.getChannelStats(type));
    }

    @PutMapping("/{type}/rules")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<SalesChannelResponse> updateChannelRules(
            @PathVariable ChannelType type,
            @Valid @RequestBody UpdateChannelRulesCommand cmd) {
        if (cmd.channelType() != type) {
            return ApiResult.error("channel.type.mismatch");
        }
        return ApiResult.ok(service.updateChannelRules(cmd), "channel.rules.updated");
    }

    @PatchMapping("/{type}/activate")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<SalesChannelResponse> activate(@PathVariable ChannelType type) {
        return ApiResult.ok(service.activateChannel(type), "channel.activated");
    }

    @PatchMapping("/{type}/deactivate")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<SalesChannelResponse> deactivate(@PathVariable ChannelType type) {
        return ApiResult.ok(service.deactivateChannel(type), "channel.deactivated");
    }
}

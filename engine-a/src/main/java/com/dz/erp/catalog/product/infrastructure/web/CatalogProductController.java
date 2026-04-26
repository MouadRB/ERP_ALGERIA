package com.dz.erp.catalog.product.infrastructure.web;

import com.dz.erp.catalog.product.application.CatalogProductService;
import com.dz.erp.catalog.product.application.dto.*;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.VisibilityRule;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/catalog/v1/products")
@RequiredArgsConstructor
public class CatalogProductController {

    private final CatalogProductService service;

    @GetMapping("/{skuCode}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<CatalogProductResponse> getDetail(@PathVariable String skuCode) {
        return ApiResult.ok(service.getProductDetail(skuCode));
    }

    @PostMapping("/{skuCode}/publish")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<CatalogProductResponse> publish(@PathVariable String skuCode,
                                                      @Valid @RequestBody PublishProductCommand cmd) {
        validatePathMatchesBody(skuCode, cmd.skuCode());
        return ApiResult.ok(service.publishProduct(cmd), "catalog.product.published");
    }

    @PostMapping("/{skuCode}/unpublish")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<CatalogProductResponse> unpublish(@PathVariable String skuCode) {
        return ApiResult.ok(service.unpublishProduct(new UnpublishProductCommand(skuCode)), "catalog.product.unpublished");
    }

    @PostMapping("/{skuCode}/schedule")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<CatalogProductResponse> schedule(@PathVariable String skuCode,
                                                       @Valid @RequestBody SchedulePublicationCommand cmd) {
        validatePathMatchesBody(skuCode, cmd.skuCode());
        return ApiResult.ok(service.schedulePublication(cmd), "catalog.product.scheduled");
    }

    @DeleteMapping("/{skuCode}/schedule")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<CatalogProductResponse> cancelSchedule(@PathVariable String skuCode) {
        return ApiResult.ok(service.cancelSchedule(skuCode), "catalog.product.schedule.cancelled");
    }

    @PostMapping("/{skuCode}/channels/{channel}/toggle")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<CatalogProductResponse> toggleChannel(@PathVariable String skuCode,
                                                            @PathVariable String channel,
                                                            @RequestParam boolean enabled) {
        var ch = parseEnum(ChannelType.class, channel, "channel");
        return ApiResult.ok(service.toggleChannel(new ToggleChannelCommand(skuCode, ch, enabled)), "catalog.channel.toggled");
    }

    @PostMapping("/{skuCode}/rules/{rule}/toggle")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<CatalogProductResponse> toggleRule(@PathVariable String skuCode,
                                                         @PathVariable String rule,
                                                         @RequestParam boolean enabled) {
        var r = parseEnum(VisibilityRule.class, rule, "rule");
        return ApiResult.ok(service.toggleRule(new ToggleRuleCommand(skuCode, r, enabled)), "catalog.rule.toggled");
    }

    @GetMapping("/{skuCode}/diagnostic")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<DiagnosticResponse> diagnostic(@PathVariable String skuCode) {
        return ApiResult.ok(service.getDiagnostic(skuCode));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<BulkActionResponse> bulk(@Valid @RequestBody BulkActionCommand cmd) {
        return ApiResult.ok(service.bulkAction(cmd), "catalog.bulk.completed");
    }

    private void validatePathMatchesBody(String pathSku, String bodySku) {
        if (bodySku != null && !pathSku.equals(bodySku)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Path skuCode '" + pathSku + "' does not match body skuCode '" + bodySku + "'");
        }
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumType, String value, String paramName) {
        try {
            return Enum.valueOf(enumType, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid " + paramName + ": '" + value + "'");
        }
    }
}

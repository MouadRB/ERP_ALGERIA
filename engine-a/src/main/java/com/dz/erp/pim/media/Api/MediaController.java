package com.dz.erp.pim.media.Api;

import com.dz.erp.pim.media.application.MediaService;
import com.dz.erp.pim.media.application.dto.*;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pim/v1/products/{productId}/media")
@RequiredArgsConstructor
public class MediaController {
    private final MediaService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<MediaResponse> upload(@PathVariable String productId, @RequestBody UploadMediaCommand cmd) {
        return ApiResult.ok(svc.upload(productId, cmd), "media.uploaded");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<MediaResponse>> list(@PathVariable String productId) {
        return ApiResult.ok(svc.list(productId));
    }

    @DeleteMapping("/{mediaId}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<Void> delete(@PathVariable String productId, @PathVariable String mediaId) {
        svc.delete(mediaId);
        return ApiResult.ok(null, "media.deleted");
    }
}

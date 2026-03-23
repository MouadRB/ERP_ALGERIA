package com.dz.erp.shared.notification.Api;

import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.notification.application.NotificationService;
import com.dz.erp.shared.notification.application.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService svc;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResult<List<NotificationResponse>> list(
            @RequestParam(required = false) Boolean unread,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResult.paged(svc.getForCurrentUser(unread, page, size));
    }

    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<UnreadCountResponse> count() {
        return ApiResult.ok(svc.countUnread());
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<Void> markRead(@PathVariable String id) {
        svc.markRead(id);
        return ApiResult.ok(null);
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<Void> markAllRead() {
        svc.markAllRead();
        return ApiResult.ok(null);
    }
}

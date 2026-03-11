package com.dz.erp.shared.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Common API response — every endpoint returns this exact shape.
 * <p>
 * Success (single):
 * {
 * "success": true,
 * "data": { ... },
 * "message": "SKU registered successfully",
 * "timestamp": "2026-03-01T10:00:00Z"
 * }
 * <p>
 * Success (list with pagination):
 * {
 * "success": true,
 * "data": [ ... ],
 * "pagination": { "page": 0, "size": 25, "totalElements": 100, "totalPages": 4 },
 * "timestamp": "2026-03-01T10:00:00Z"
 * }
 * <p>
 * Error:
 * {
 * "success": false,
 * "message": "SKU not found: SKU-999",
 * "errors": { "skuCode": "required" },
 * "timestamp": "2026-03-01T10:00:00Z"
 * }
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResult<T>(
        boolean success,
        T data,
        String message,
        PageInfo pagination,
        Map<String, String> errors,
        Instant timestamp
) {
    // ── Success ──

    public static <T> ApiResult<T> ok(T data) {
        return new ApiResult<>(true, data, null, null, null, Instant.now());
    }

    public static <T> ApiResult<T> ok(T data, String message) {
        return new ApiResult<>(true, data, message, null, null, Instant.now());
    }

    // ── Paged ──

    public static <T> ApiResult<List<T>> paged(Page<T> page) {
        return new ApiResult<>(true, page.getContent(), null,
                PageInfo.from(page), null, Instant.now());
    }

    // ── Error ──

    public static <T> ApiResult<T> error(String message) {
        return new ApiResult<>(false, null, message, null, null, Instant.now());
    }

    public static <T> ApiResult<T> error(String message, Map<String, String> fieldErrors) {
        return new ApiResult<>(false, null, message, null, fieldErrors, Instant.now());
    }

    // ── Pagination info ──

    public record PageInfo(int page, int size, long totalElements, int totalPages) {
        public static PageInfo from(Page<?> p) {
            return new PageInfo(p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        }
    }
}

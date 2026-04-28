package com.dz.erp.pim.ocr.Api;

import com.dz.erp.pim.ocr.application.OcrJobService;
import com.dz.erp.pim.ocr.application.dto.CommitOcrJobCommand;
import com.dz.erp.pim.ocr.application.dto.OcrJobResponse;
import com.dz.erp.pim.ocr.domain.model.OcrJobStatus;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/pim/v1/ocr/jobs")
@RequiredArgsConstructor
public class OcrJobController {

    private final OcrJobService svc;

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.PROCUREMENT_MANAGER + "')")
    public ApiResult<OcrJobResponse> upload(@RequestPart("file") MultipartFile file) {
        return ApiResult.ok(svc.upload(file), "ocr.job.queued");
    }

    @GetMapping("/{jobId}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.PROCUREMENT_MANAGER + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<OcrJobResponse> get(@PathVariable String jobId) {
        return ApiResult.ok(svc.get(jobId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.PROCUREMENT_MANAGER + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<OcrJobResponse>> search(@RequestParam(required = false) OcrJobStatus status,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "25") int size) {
        return ApiResult.paged(svc.search(status, page, size));
    }

    @PostMapping("/{jobId}/commit")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.PROCUREMENT_MANAGER + "')")
    public ApiResult<OcrJobResponse> commit(@PathVariable String jobId,
                                            @Valid @RequestBody CommitOcrJobCommand cmd) {
        return ApiResult.ok(svc.commit(jobId, cmd), "ocr.job.committed");
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.PROCUREMENT_MANAGER + "')")
    public ApiResult<OcrJobResponse> cancel(@PathVariable String jobId) {
        return ApiResult.ok(svc.cancel(jobId), "ocr.job.cancelled");
    }
}

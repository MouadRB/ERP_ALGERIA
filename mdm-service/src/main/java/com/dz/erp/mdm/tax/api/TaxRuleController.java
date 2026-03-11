package com.dz.erp.mdm.tax.api;

import com.dz.erp.mdm.tax.application.TaxRuleService;
import com.dz.erp.mdm.tax.application.dto.*;
import com.dz.erp.mdm.tax.domain.model.TaxRuleStatus;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mdm/v1/tax-rules")
@RequiredArgsConstructor
public class TaxRuleController {
    private final TaxRuleService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','FINANCE_MANAGER')")
    public ApiResult<TaxRuleResponse> create(@Valid @RequestBody CreateTaxRuleCommand cmd) {
        return ApiResult.ok(svc.create(cmd), "tax.rule.created");
    }

    @PutMapping("/{code}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','FINANCE_MANAGER')")
    public ApiResult<TaxRuleResponse> update(@PathVariable String code, @Valid @RequestBody UpdateTaxRuleCommand cmd) {
        return ApiResult.ok(svc.update(code, cmd), "tax.rule.updated");
    }


    @PatchMapping("/{code}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','FINANCE_MANAGER')")
    public ApiResult<TaxRuleResponse> activate(@PathVariable String code) {
        return ApiResult.ok(svc.activate(code), "tax.rule.activated");
    }

    @PatchMapping("/{code}/archive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','FINANCE_MANAGER')")
    public ApiResult<TaxRuleResponse> archive(@PathVariable String code) {
        return ApiResult.ok(svc.archive(code), "tax.rule.archived");
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','FINANCE_MANAGER')")
    public ApiResult<TaxRuleResponse> getOne(@PathVariable String code) {
        return ApiResult.ok(svc.getByCode(code));
    }

    @GetMapping("/resolve")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<TaxRuleResponse> resolve(@RequestParam String category) {
        return ApiResult.ok(svc.resolve(category));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','FINANCE_MANAGER')")
    public ApiResult<List<TaxRuleResponse>> search(@RequestParam(required = false) String category,
                                                   @RequestParam(required = false) TaxRuleStatus status,
                                                   @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
        return ApiResult.paged(svc.search(new TaxRuleSearchQuery(category, status, page, size)));
    }
}

package com.dz.erp.shared.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter @RequiredArgsConstructor
public enum ErrorCode {
    // ── SKU ──
    SKU_NOT_FOUND("sku.not.found", HttpStatus.NOT_FOUND),
    SKU_DUPLICATE("sku.duplicate", HttpStatus.CONFLICT),
    SKU_INVALID_TRANSITION("sku.invalid.status.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    SKU_SOD_VIOLATION("sku.sod.violation", HttpStatus.FORBIDDEN),
    SKU_ALREADY_ACTIVE("sku.already.active", HttpStatus.CONFLICT),
    SKU_ALREADY_DISCONTINUED("sku.already.discontinued", HttpStatus.CONFLICT),
    SKU_NOT_EDITABLE("sku.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── Supplier ──
    SUPPLIER_NOT_FOUND("supplier.not.found", HttpStatus.NOT_FOUND),
    SUPPLIER_DUPLICATE("supplier.duplicate", HttpStatus.CONFLICT),
    SUPPLIER_INVALID_TRANSITION("supplier.invalid.status.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    SUPPLIER_SOD_VIOLATION("supplier.sod.violation", HttpStatus.FORBIDDEN),
    SUPPLIER_ALREADY_ACTIVE("supplier.already.active", HttpStatus.CONFLICT),
    SUPPLIER_ALREADY_SUSPENDED("supplier.already.suspended", HttpStatus.CONFLICT),
    SUPPLIER_ALREADY_BLACKLISTED("supplier.already.blacklisted", HttpStatus.CONFLICT),
    SUPPLIER_NOT_EDITABLE("supplier.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── Tax Rules ──
    TAX_RULE_NOT_FOUND("tax.rule.not.found", HttpStatus.NOT_FOUND),
    TAX_RULE_DUPLICATE("tax.rule.duplicate", HttpStatus.CONFLICT),
    TAX_RULE_INVALID_TRANSITION("tax.rule.invalid.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    TAX_RULE_SOD_VIOLATION("tax.rule.sod.violation", HttpStatus.FORBIDDEN),
    TAX_RULE_NOT_EDITABLE("tax.rule.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),
    TAX_RULE_NO_ACTIVE_RULE("tax.rule.no.active.rule", HttpStatus.NOT_FOUND),

    // ── Wilaya ──
    WILAYA_NOT_FOUND("wilaya.not.found", HttpStatus.NOT_FOUND),
    WILAYA_DUPLICATE("wilaya.duplicate", HttpStatus.CONFLICT),
    WILAYA_INVALID_TRANSITION("wilaya.invalid.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    WILAYA_SOD_VIOLATION("wilaya.sod.violation", HttpStatus.FORBIDDEN),
    WILAYA_NOT_EDITABLE("wilaya.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),
    WILAYA_NOT_DELIVERABLE("wilaya.not.deliverable", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── Bin Locations ──
    BIN_NOT_FOUND("bin.not.found", HttpStatus.NOT_FOUND),
    BIN_DUPLICATE("bin.duplicate", HttpStatus.CONFLICT),
    BIN_INVALID_TRANSITION("bin.invalid.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    BIN_SOD_VIOLATION("bin.sod.violation", HttpStatus.FORBIDDEN),
    BIN_NOT_EDITABLE("bin.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),
    BIN_AT_CAPACITY("bin.at.capacity", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── Generic ──
    INTERNAL_ERROR("error.internal", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED("error.unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("error.forbidden", HttpStatus.FORBIDDEN),
    BAD_REQUEST("error.bad.request", HttpStatus.BAD_REQUEST);

    private final String messageKey;
    private final HttpStatus httpStatus;
}

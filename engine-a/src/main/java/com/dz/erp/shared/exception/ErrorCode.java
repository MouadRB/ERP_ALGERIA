package com.dz.erp.shared.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter @RequiredArgsConstructor
public enum ErrorCode {

    // ── Product ──
    PRODUCT_NOT_FOUND("product.not.found", HttpStatus.NOT_FOUND),
    PRODUCT_DUPLICATE_SKU("product.duplicate.sku", HttpStatus.CONFLICT),
    PRODUCT_INVALID_TRANSITION("product.invalid.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    PRODUCT_SOD_VIOLATION("product.sod.violation", HttpStatus.FORBIDDEN),
    PRODUCT_NOT_EDITABLE("product.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),
    PRODUCT_SKU_NOT_ACTIVE("product.sku.not.active", HttpStatus.UNPROCESSABLE_ENTITY),
    PRODUCT_SKU_IS_DISCONTINUED("product.sku.is.discountinued", HttpStatus.UNPROCESSABLE_ENTITY),
    PRODUCT_SKU_PENDING_MDM_ACTIVATION("product.sku.pending.mdm.activation", HttpStatus.UNPROCESSABLE_ENTITY),
    PRODUCT_FLAGGED("product.flagged", HttpStatus.UNPROCESSABLE_ENTITY),
    PRODUCT_SUPPLIER_NOT_ACTIVE("product.supplier.not.active", HttpStatus.UNPROCESSABLE_ENTITY),
    PRODUCT_SUPPLIER_NOT_FOUND("product.supplier.not.found", HttpStatus.UNPROCESSABLE_ENTITY),
    PRODUCT_NO_PRINCIPAL_IMAGE("product.no.principal.image", HttpStatus.UNPROCESSABLE_ENTITY),
    product_supplier_not_found("product.supplier.not.found", HttpStatus.NOT_FOUND),
    // ── Variant ──
    VARIANT_NOT_FOUND("variant.not.found", HttpStatus.NOT_FOUND),
    VARIANT_DUPLICATE_SKU("variant.duplicate.sku", HttpStatus.CONFLICT),
    VARIANT_HAS_STOCK("variant.has.stock", HttpStatus.UNPROCESSABLE_ENTITY),
    ATTRIBUTE_NOT_FOUND("attribute.not.found", HttpStatus.NOT_FOUND),

    // ── Media ──
    MEDIA_LIMIT_EXCEEDED("media.limit.exceeded", HttpStatus.UNPROCESSABLE_ENTITY),
    MEDIA_TOO_LARGE("media.too.large", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── Pricing ──
    PRICE_NOT_SET("price.not.set", HttpStatus.NOT_FOUND),
    PRICE_TAX_RULE_NOT_FOUND("price.tax.rule.not.found", HttpStatus.NOT_FOUND),

    // ── Logistics ──
    WILAYA_ALREADY_RESTRICTED("wilaya.already.restricted", HttpStatus.CONFLICT),

    // ── Generic ──
    INTERNAL_ERROR("error.internal", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED("error.unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("error.forbidden", HttpStatus.FORBIDDEN),
    BAD_REQUEST("error.bad.request", HttpStatus.BAD_REQUEST);



    private final String messageKey;
    private final HttpStatus httpStatus;
}

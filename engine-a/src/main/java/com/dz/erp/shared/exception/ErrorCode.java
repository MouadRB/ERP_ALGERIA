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

    // ── Channel ──
    CHANNEL_NOT_FOUND("channel.not.found", HttpStatus.NOT_FOUND),

    // ── Catalog ──
    CATALOG_ENTRY_NOT_FOUND("catalog.entry.not.found", HttpStatus.NOT_FOUND),
    CATALOG_PUBLISH_BLOCKED("catalog.publish.blocked", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── Category ──
    CATEGORY_CODE_EXISTS("category.code.exists", HttpStatus.CONFLICT),
    CATEGORY_PARENT_NOT_FOUND("category.parent.not.found", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND("category.not.found", HttpStatus.NOT_FOUND),
    CATEGORY_HAS_PRODUCTS("category.has.products", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── SKU (MDM) ──
    SKU_NOT_FOUND("sku.not.found", HttpStatus.NOT_FOUND),
    SKU_DUPLICATE("sku.duplicate", HttpStatus.CONFLICT),
    SKU_INVALID_TRANSITION("sku.invalid.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    SKU_SOD_VIOLATION("sku.sod.violation", HttpStatus.FORBIDDEN),
    SKU_NOT_EDITABLE("sku.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),
    SKU_ALREADY_ACTIVE("sku.already.active", HttpStatus.CONFLICT),
    SKU_ALREADY_DISCONTINUED("sku.already.discontinued", HttpStatus.CONFLICT),

    // ── Supplier (MDM) ──
    SUPPLIER_NOT_FOUND("supplier.not.found", HttpStatus.NOT_FOUND),
    SUPPLIER_DUPLICATE("supplier.duplicate", HttpStatus.CONFLICT),
    SUPPLIER_INVALID_TRANSITION("supplier.invalid.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    SUPPLIER_SOD_VIOLATION("supplier.sod.violation", HttpStatus.FORBIDDEN),
    SUPPLIER_NOT_EDITABLE("supplier.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),
    SUPPLIER_ALREADY_ACTIVE("supplier.already.active", HttpStatus.CONFLICT),
    SUPPLIER_ALREADY_SUSPENDED("supplier.already.suspended", HttpStatus.CONFLICT),
    SUPPLIER_ALREADY_BLACKLISTED("supplier.already.blacklisted", HttpStatus.CONFLICT),

    // ── Tax Rule (MDM) ──
    TAX_RULE_NOT_FOUND("tax.rule.not.found", HttpStatus.NOT_FOUND),
    TAX_RULE_DUPLICATE("tax.rule.duplicate", HttpStatus.CONFLICT),
    TAX_RULE_INVALID_TRANSITION("tax.rule.invalid.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    TAX_RULE_SOD_VIOLATION("tax.rule.sod.violation", HttpStatus.FORBIDDEN),
    TAX_RULE_NOT_EDITABLE("tax.rule.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),
    TAX_RULE_NO_ACTIVE_RULE("tax.rule.no.active.rule", HttpStatus.NOT_FOUND),

    // ── Wilaya (MDM) ──
    WILAYA_NOT_FOUND("wilaya.not.found", HttpStatus.NOT_FOUND),
    WILAYA_DUPLICATE("wilaya.duplicate", HttpStatus.CONFLICT),
    WILAYA_INVALID_TRANSITION("wilaya.invalid.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    WILAYA_SOD_VIOLATION("wilaya.sod.violation", HttpStatus.FORBIDDEN),
    WILAYA_NOT_EDITABLE("wilaya.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── Bin / Warehouse (MDM) ──
    BIN_NOT_FOUND("bin.not.found", HttpStatus.NOT_FOUND),
    BIN_DUPLICATE("bin.duplicate", HttpStatus.CONFLICT),
    BIN_INVALID_TRANSITION("bin.invalid.transition", HttpStatus.UNPROCESSABLE_ENTITY),
    BIN_SOD_VIOLATION("bin.sod.violation", HttpStatus.FORBIDDEN),
    BIN_NOT_EDITABLE("bin.not.editable", HttpStatus.UNPROCESSABLE_ENTITY),
    BIN_AT_CAPACITY("bin.at.capacity", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── Inventory: Stock ──
    STOCK_RECORD_NOT_FOUND("stock.record.not.found", HttpStatus.NOT_FOUND),
    STOCK_FROZEN("stock.frozen", HttpStatus.UNPROCESSABLE_ENTITY),
    STOCK_INVALID_QUANTITY("stock.invalid.quantity", HttpStatus.BAD_REQUEST),
    STOCK_INSUFFICIENT("stock.insufficient", HttpStatus.CONFLICT),
    STOCK_INSUFFICIENT_SOFT_RESERVE("stock.insufficient.soft.reserve", HttpStatus.CONFLICT),
    STOCK_INSUFFICIENT_HARD_RESERVE("stock.insufficient.hard.reserve", HttpStatus.CONFLICT),
    STOCK_FIFO_INSUFFICIENT_LAYERS("stock.fifo.insufficient.layers", HttpStatus.CONFLICT),

    // ── Inventory: Reservation ──
    RESERVATION_NOT_FOUND("reservation.not.found", HttpStatus.NOT_FOUND),
    RESERVATION_INVALID_UPGRADE("reservation.invalid.upgrade", HttpStatus.UNPROCESSABLE_ENTITY),
    RESERVATION_ALREADY_RELEASED("reservation.already.released", HttpStatus.CONFLICT),

    // ── Inventory: Return ──
    RETURN_NOT_FOUND("return.not.found", HttpStatus.NOT_FOUND),
    RETURN_ALREADY_INSPECTED("return.already.inspected", HttpStatus.CONFLICT),

    // ── Inventory: Alert ──
    ALERT_NOT_FOUND("alert.not.found", HttpStatus.NOT_FOUND),

    // ── OMS: Order ──
    OMS_ORDER_NOT_FOUND("oms.order.not.found", HttpStatus.NOT_FOUND),
    OMS_ORDER_DUPLICATE_IDEMPOTENCY("oms.order.duplicate.idempotency", HttpStatus.OK),
    OMS_ORDER_INVALID_STATE("oms.order.invalid.state", HttpStatus.CONFLICT),
    OMS_CHANNEL_INACTIVE("oms.channel.inactive", HttpStatus.UNPROCESSABLE_ENTITY),
    OMS_PRODUCT_NOT_PUBLISHED_ON_CHANNEL("oms.product.not.published.on.channel", HttpStatus.UNPROCESSABLE_ENTITY),
    OMS_STOCK_INSUFFICIENT("oms.stock.insufficient", HttpStatus.UNPROCESSABLE_ENTITY),
    OMS_WILAYA_NOT_SUPPORTED("oms.wilaya.not.supported", HttpStatus.UNPROCESSABLE_ENTITY),
    OMS_RESERVATION_FAILED("oms.reservation.failed", HttpStatus.UNPROCESSABLE_ENTITY),

    // ── OMS: Integration / Carrier ──
    OMS_CARRIER_SUBMIT_FAILED("oms.carrier.submit.failed", HttpStatus.SERVICE_UNAVAILABLE),
    OMS_CARRIER_WEBHOOK_SIGNATURE_INVALID("oms.carrier.webhook.signature.invalid", HttpStatus.UNAUTHORIZED),
    OMS_CARRIER_NOT_CONFIGURED("oms.carrier.not.configured", HttpStatus.UNPROCESSABLE_ENTITY),
    OMS_CARRIER_UNAVAILABLE("oms.carrier.unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    OMS_SEARCH_UNAVAILABLE("oms.search.unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    OMS_SHIPMENT_NOT_FOUND("oms.shipment.not.found", HttpStatus.NOT_FOUND),

    // ── OMS: Returns ──
    OMS_RETURN_WINDOW_EXPIRED("oms.return.window.expired", HttpStatus.UNPROCESSABLE_ENTITY),
    OMS_RETURN_NOT_FOUND("oms.return.not.found", HttpStatus.NOT_FOUND),

    // ── PIM: OCR Import ──
    OCR_JOB_NOT_FOUND("ocr.job.not.found", HttpStatus.NOT_FOUND),
    OCR_JOB_INVALID_STATE("ocr.job.invalid.state", HttpStatus.UNPROCESSABLE_ENTITY),
    OCR_LINE_NOT_FOUND("ocr.line.not.found", HttpStatus.NOT_FOUND),
    OCR_FILE_EMPTY("ocr.file.empty", HttpStatus.BAD_REQUEST),
    OCR_FILE_TOO_LARGE("ocr.file.too.large", HttpStatus.PAYLOAD_TOO_LARGE),
    OCR_FILE_UNSUPPORTED_TYPE("ocr.file.unsupported.type", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    OCR_FILE_READ_ERROR("ocr.file.read.error", HttpStatus.BAD_REQUEST),
    OCR_ENGINE_UNAVAILABLE("ocr.engine.unavailable", HttpStatus.SERVICE_UNAVAILABLE),

    // ── Generic ──
    INTERNAL_ERROR("error.internal", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED("error.unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("error.forbidden", HttpStatus.FORBIDDEN),
    BAD_REQUEST("error.bad.request", HttpStatus.BAD_REQUEST);



    private final String messageKey;
    private final HttpStatus httpStatus;
}

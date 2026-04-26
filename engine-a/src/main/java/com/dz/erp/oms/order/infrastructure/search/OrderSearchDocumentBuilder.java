package com.dz.erp.oms.order.infrastructure.search;

import com.dz.erp.oms.order.domain.model.Order;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Produces the denormalized document shape for {@code oms-orders}. Built from an
 * {@link Order} aggregate — includes status, customer, wilaya, channel, totals,
 * and timeline fields so CS dashboards can filter without joining tables.
 */
final class OrderSearchDocumentBuilder {

    private OrderSearchDocumentBuilder() {}

    static Map<String, Object> toDocument(Order o) {
        var doc = new LinkedHashMap<String, Object>();
        doc.put("order_id", o.getOrderId().toString());
        doc.put("tenant_id", o.getTenantId());
        doc.put("channel_code", o.getChannelCode());
        doc.put("external_order_ref", o.getExternalOrderRef());
        doc.put("customer_id", o.getCustomerId());
        doc.put("status", o.getStatus().name());
        doc.put("payment_method", o.getPaymentMethod() != null ? o.getPaymentMethod().name() : null);
        doc.put("currency", o.getCurrency());
        doc.put("subtotal_ht", o.getSubtotalHt());
        doc.put("tax_total", o.getTaxTotal());
        doc.put("shipping_fee", o.getShippingFee());
        doc.put("grand_total_ttc", o.getGrandTotalTtc());

        var ship = o.getShippingAddress();
        if (ship != null) {
            doc.put("recipient_name", ship.recipientName());
            doc.put("phone", ship.phone());
            doc.put("wilaya_code", ship.wilayaCode());
            doc.put("commune", ship.commune());
        }

        doc.put("placed_at", o.getPlacedAt() != null ? o.getPlacedAt().toString() : null);
        doc.put("validated_at", o.getValidatedAt() != null ? o.getValidatedAt().toString() : null);
        doc.put("confirmed_at", o.getConfirmedAt() != null ? o.getConfirmedAt().toString() : null);
        doc.put("shipped_at", o.getShippedAt() != null ? o.getShippedAt().toString() : null);
        doc.put("delivered_at", o.getDeliveredAt() != null ? o.getDeliveredAt().toString() : null);
        doc.put("closed_at", o.getClosedAt() != null ? o.getClosedAt().toString() : null);
        doc.put("updated_at", o.getUpdatedAt() != null ? o.getUpdatedAt().toString() : null);
        doc.put("line_count", o.getLines() != null ? o.getLines().size() : 0);
        return doc;
    }
}

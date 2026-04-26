package com.dz.erp.oms.order.application.mapper;

import com.dz.erp.oms.order.application.dto.AddressCommand;
import com.dz.erp.oms.order.application.dto.OrderLineResponse;
import com.dz.erp.oms.order.application.dto.OrderResponse;
import com.dz.erp.oms.order.application.dto.OrderStatusHistoryResponse;
import com.dz.erp.oms.order.domain.model.Address;
import com.dz.erp.oms.order.domain.model.Order;
import org.springframework.stereotype.Component;

/**
 * Domain → DTO translation for the Order aggregate.
 *
 * <p>Responses reuse {@link AddressCommand} as the address shape — keeps the request
 * and response symmetric so clients can echo a GET into a new POST without reshaping.
 */
@Component
public class OrderDtoMapper {

    public OrderResponse toResponse(Order o) {
        return new OrderResponse(
                o.getOrderId(),
                o.getChannelCode(),
                o.getExternalOrderRef(),
                o.getIdempotencyKey(),
                o.getCustomerId(),
                o.getStatus(),
                o.getPaymentMethod(),
                o.getCurrency(),
                o.getSubtotalHt(),
                o.getTaxTotal(),
                o.getShippingFee(),
                o.getGrandTotalTtc(),
                toAddress(o.getShippingAddress()),
                toAddress(o.getBillingAddress()),
                o.getLines().stream().map(l -> new OrderLineResponse(
                        l.getOrderLineId(), l.getSkuCode(), l.getVariantId(),
                        l.getProductNameSnapshotFr(), l.getProductNameSnapshotAr(),
                        l.getUnitPriceHt(), l.getUnitPriceTtc(), l.getTaxRuleCode(),
                        l.getQuantity(), l.getLineTotalTtc(), l.getReservationId()
                )).toList(),
                o.getStatusHistory().stream().map(h -> new OrderStatusHistoryResponse(
                        h.fromStatus(), h.toStatus(), h.event(), h.actorUserId(), h.at()
                )).toList(),
                o.getPlacedAt(),
                o.getValidatedAt(),
                o.getConfirmedAt(),
                o.getShippedAt(),
                o.getDeliveredAt(),
                o.getClosedAt(),
                o.getUpdatedAt(),
                o.getRejectionReasonCode(),
                o.getRejectionReasonMessage()
        );
    }

    private AddressCommand toAddress(Address a) {
        if (a == null) return null;
        return new AddressCommand(
                a.recipientName(), a.phone(), a.wilayaCode(), a.commune(),
                a.line1(), a.line2(), a.postalCode(), a.notes());
    }
}

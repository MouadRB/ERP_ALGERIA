package com.dz.erp.oms.order.infrastructure.mapper;

import com.dz.erp.oms.order.domain.model.Address;
import com.dz.erp.oms.order.domain.model.Order;
import com.dz.erp.oms.order.domain.model.OrderLine;
import com.dz.erp.oms.order.domain.model.OrderStatusHistory;
import com.dz.erp.oms.order.infrastructure.persistence.AddressEmbeddable;
import com.dz.erp.oms.order.infrastructure.persistence.OrderJpaEntity;
import com.dz.erp.oms.order.infrastructure.persistence.OrderLineJpaEntity;
import com.dz.erp.oms.order.infrastructure.persistence.OrderStatusHistoryJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Converts between the domain {@link Order} aggregate and its JPA representation.
 *
 * <p>Kept hand-written (not MapStruct) because the aggregate has private constructors,
 * factory methods, and carries a transient event list that the mapper must be careful
 * not to touch. A MapStruct mapper here would fight the DDD shape of the model.
 *
 * <p>{@link #toJpa(Order, OrderJpaEntity)} mutates an existing entity in place when
 * given one — this lets the adapter preserve JPA's {@code @Version} and identity
 * so {@code saveAndFlush} stays a merge, not an insert-then-insert.
 */
@Component
public class OrderPersistenceMapper {

    // ──────────────────────────────────────────────
    // Domain → JPA
    // ──────────────────────────────────────────────

    public OrderJpaEntity toJpa(Order o, OrderJpaEntity existing) {
        OrderJpaEntity e = (existing != null) ? existing : new OrderJpaEntity();

        e.setOrderId(o.getOrderId());
        e.setTenantId(o.getTenantId());
        e.setChannelCode(o.getChannelCode());
        e.setExternalOrderRef(o.getExternalOrderRef());
        e.setIdempotencyKey(o.getIdempotencyKey());
        e.setCustomerId(o.getCustomerId());
        e.setStatus(o.getStatus());
        e.setPaymentMethod(o.getPaymentMethod());
        e.setCurrency(o.getCurrency());
        e.setSubtotalHt(o.getSubtotalHt());
        e.setTaxTotal(o.getTaxTotal());
        e.setShippingFee(o.getShippingFee());
        e.setGrandTotalTtc(o.getGrandTotalTtc());
        e.setShippingAddress(toEmbeddable(o.getShippingAddress()));
        e.setBillingAddress(toEmbeddable(o.getBillingAddress()));
        e.setPlacedAt(o.getPlacedAt());
        e.setValidatedAt(o.getValidatedAt());
        e.setConfirmedAt(o.getConfirmedAt());
        e.setShippedAt(o.getShippedAt());
        e.setDeliveredAt(o.getDeliveredAt());
        e.setClosedAt(o.getClosedAt());
        e.setUpdatedAt(o.getUpdatedAt());
        e.setRejectionReasonCode(o.getRejectionReasonCode());
        e.setRejectionReasonMessage(o.getRejectionReasonMessage());

        // Replace children wholesale — orphanRemoval deletes dropped rows.
        e.getLines().clear();
        for (OrderLine line : o.getLines()) {
            e.getLines().add(toJpaLine(line, e));
        }
        e.getStatusHistory().clear();
        for (OrderStatusHistory h : o.getStatusHistory()) {
            e.getStatusHistory().add(toJpaHistory(h, e));
        }
        return e;
    }

    private OrderLineJpaEntity toJpaLine(OrderLine line, OrderJpaEntity parent) {
        OrderLineJpaEntity le = new OrderLineJpaEntity();
        le.setOrderLineId(line.getOrderLineId());
        le.setOrder(parent);
        le.setSkuCode(line.getSkuCode());
        le.setVariantId(line.getVariantId());
        le.setProductNameSnapshotFr(line.getProductNameSnapshotFr());
        le.setProductNameSnapshotAr(line.getProductNameSnapshotAr());
        le.setUnitPriceHt(line.getUnitPriceHt());
        le.setUnitPriceTtc(line.getUnitPriceTtc());
        le.setTaxRuleCode(line.getTaxRuleCode());
        le.setQuantity(line.getQuantity());
        le.setLineTotalTtc(line.getLineTotalTtc());
        le.setReservationId(line.getReservationId());
        return le;
    }

    private OrderStatusHistoryJpaEntity toJpaHistory(OrderStatusHistory h, OrderJpaEntity parent) {
        OrderStatusHistoryJpaEntity he = new OrderStatusHistoryJpaEntity();
        he.setId(h.id());
        he.setOrder(parent);
        he.setFromStatus(h.fromStatus());
        he.setToStatus(h.toStatus());
        he.setEvent(h.event());
        he.setActorUserId(h.actorUserId());
        he.setAt(h.at());
        return he;
    }

    private AddressEmbeddable toEmbeddable(Address a) {
        if (a == null) return null;
        return new AddressEmbeddable(
                a.recipientName(), a.phone(), a.wilayaCode(), a.commune(),
                a.line1(), a.line2(), a.postalCode(), a.notes());
    }

    // ──────────────────────────────────────────────
    // JPA → Domain
    // ──────────────────────────────────────────────

    public Order toDomain(OrderJpaEntity e) {
        List<OrderLine> lines = new ArrayList<>(e.getLines().size());
        for (OrderLineJpaEntity le : e.getLines()) {
            lines.add(OrderLine.reconstitute(
                    le.getOrderLineId(), le.getSkuCode(), le.getVariantId(),
                    le.getProductNameSnapshotFr(), le.getProductNameSnapshotAr(),
                    le.getUnitPriceHt(), le.getUnitPriceTtc(), le.getTaxRuleCode(),
                    le.getQuantity(), le.getLineTotalTtc(), le.getReservationId()));
        }
        List<OrderStatusHistory> history = new ArrayList<>(e.getStatusHistory().size());
        for (OrderStatusHistoryJpaEntity he : e.getStatusHistory()) {
            history.add(new OrderStatusHistory(
                    he.getId(), e.getOrderId(),
                    he.getFromStatus(), he.getToStatus(),
                    he.getEvent(), he.getActorUserId(), he.getAt()));
        }
        return Order.reconstitute(
                e.getOrderId(), e.getTenantId(), e.getChannelCode(),
                e.getExternalOrderRef(), e.getIdempotencyKey(), e.getCustomerId(),
                e.getStatus(), e.getPaymentMethod(),
                e.getCurrency(), e.getSubtotalHt(), e.getTaxTotal(),
                e.getShippingFee(), e.getGrandTotalTtc(),
                toDomainAddress(e.getShippingAddress()),
                toDomainAddress(e.getBillingAddress()),
                lines, history,
                e.getPlacedAt(), e.getValidatedAt(), e.getConfirmedAt(),
                e.getShippedAt(), e.getDeliveredAt(), e.getClosedAt(),
                e.getUpdatedAt(), e.getVersion(),
                e.getRejectionReasonCode(), e.getRejectionReasonMessage());
    }

    private Address toDomainAddress(AddressEmbeddable a) {
        if (a == null) return null;
        return new Address(
                a.getRecipientName(), a.getPhone(), a.getWilayaCode(), a.getCommune(),
                a.getLine1(), a.getLine2(), a.getPostalCode(), a.getNotes());
    }
}

package com.dz.erp.oms.order.application.dto;

import com.dz.erp.oms.order.domain.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Channel submission payload — what {@code POST /oms/v1/orders} accepts.
 *
 * <p>Idempotency is carried on the HTTP {@code Idempotency-Key} header (not in this
 * DTO) — the controller passes it to {@code OrderIntakeService.place(cmd, key)}.
 */
public record PlaceOrderCommand(
        @NotBlank @Size(max = 50) String channelCode,
        @Size(max = 100) String externalOrderRef,
        @NotBlank String customerId,
        @NotNull PaymentMethod paymentMethod,
        @NotBlank @Size(min = 3, max = 3) String currency,
        @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal subtotalHt,
        @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal taxTotal,
        @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal shippingFee,
        @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal grandTotalTtc,
        @NotNull @Valid AddressCommand shippingAddress,
        @Valid AddressCommand billingAddress,
        @NotEmpty @Valid List<OrderLineCommand> lines
) {}

package com.dz.erp.oms.order.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Inbound address DTO — carried on {@link PlaceOrderCommand}.
 *
 * <p>Validation is kept at the Api boundary (Bean Validation). The domain
 * {@code Address} record re-validates structurally — defence in depth.
 */
public record AddressCommand(
        @NotBlank String recipientName,
        @NotBlank @Size(max = 40) String phone,
        @NotBlank @Pattern(regexp = "^(0[1-9]|[1-5][0-9])$",
                message = "wilayaCode must be 01..58") String wilayaCode,
        @NotBlank String commune,
        @NotBlank String line1,
        String line2,
        String postalCode,
        String notes
) {}

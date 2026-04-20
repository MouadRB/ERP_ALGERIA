package com.dz.erp.oms.order.domain.model;

/**
 * Address value object — <b>snapshot</b> copied into the order at intake.
 *
 * <p>Persisted as JSON on {@code orders.shipping_address_snapshot} /
 * {@code orders.billing_address_snapshot}. The order never re-resolves addresses
 * from customer master data — see {@code docs/OMS_MODULE.md} §4.1 "Snapshots".
 *
 * @param recipientName full name of the recipient
 * @param phone         E.164-ish phone number (carriers require a contact)
 * @param wilayaCode    Algerian wilaya code (01..58) — validated by MDM at intake
 * @param commune       commune / city name
 * @param line1         street address, building number
 * @param line2         apartment, floor, landmark (nullable)
 * @param postalCode    postal code (nullable — optional in DZ)
 * @param notes         free-form delivery notes (nullable)
 */
public record Address(
        String recipientName,
        String phone,
        String wilayaCode,
        String commune,
        String line1,
        String line2,
        String postalCode,
        String notes
) {
    public Address {
        if (recipientName == null || recipientName.isBlank()) {
            throw new IllegalArgumentException("recipientName is required");
        }
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("phone is required");
        }
        if (wilayaCode == null || wilayaCode.isBlank()) {
            throw new IllegalArgumentException("wilayaCode is required");
        }
        if (commune == null || commune.isBlank()) {
            throw new IllegalArgumentException("commune is required");
        }
        if (line1 == null || line1.isBlank()) {
            throw new IllegalArgumentException("line1 is required");
        }
    }
}

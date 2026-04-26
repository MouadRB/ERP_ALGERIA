package com.dz.erp.oms.order.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA embeddable mirror of {@link com.dz.erp.oms.order.domain.model.Address}.
 *
 * <p>Used twice on {@link OrderJpaEntity} — for shipping and billing — with
 * {@code @AttributeOverrides} to distinguish column names. The design calls for
 * JSON snapshots (§4.1) but embeddable columns give us typed queries and are
 * equivalent in immutability.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddressEmbeddable {

    @Column(length = 200)
    private String recipientName;

    @Column(length = 40)
    private String phone;

    @Column(length = 2)
    private String wilayaCode;

    @Column(length = 100)
    private String commune;

    @Column(length = 255)
    private String line1;

    @Column(length = 255)
    private String line2;

    @Column(length = 20)
    private String postalCode;

    @Column(length = 500)
    private String notes;
}

package com.dz.erp.oms.integration.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "carrier_webhook_events", schema = "oms_schema")
@IdClass(CarrierWebhookEventJpaEntity.Key.class)
@Getter
@Setter
@NoArgsConstructor
public class CarrierWebhookEventJpaEntity {

    @Id
    @Column(name = "carrier_code", nullable = false, length = 40)
    private String carrierCode;

    @Id
    @Column(name = "event_id", nullable = false, length = 120)
    private String eventId;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;

    public static class Key implements Serializable {
        private String carrierCode;
        private String eventId;

        public Key() {}
        public Key(String carrierCode, String eventId) {
            this.carrierCode = carrierCode;
            this.eventId = eventId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Key k)) return false;
            return Objects.equals(carrierCode, k.carrierCode) && Objects.equals(eventId, k.eventId);
        }
        @Override
        public int hashCode() { return Objects.hash(carrierCode, eventId); }
    }
}

package com.dz.erp.inventory.reservation.infrastructure.mapper;

import com.dz.erp.inventory.reservation.domain.model.Reservation;
import com.dz.erp.inventory.reservation.infrastructure.persistence.ReservationJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReservationPersistenceMapper {
    ReservationJpaEntity toJpa(Reservation r);

    default Reservation toDomain(ReservationJpaEntity e) {
        if (e == null) return null;
        return Reservation.reconstitute(
                e.getReservationId(), e.getTenantId(), e.getStockRecordId(), e.getSkuCode(),
                e.getOrderId(), e.getClientRef(), e.getReservationType(), e.getQuantity(),
                e.getStatus(), e.getOmsStatus(), e.getExpiresAt(),
                e.getUpgradedAt(), e.getReleasedAt(), e.getCreatedBy(), e.getCreatedAt(), e.getVersion());
    }
}

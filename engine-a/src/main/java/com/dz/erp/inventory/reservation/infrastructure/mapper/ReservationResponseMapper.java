package com.dz.erp.inventory.reservation.infrastructure.mapper;

import com.dz.erp.inventory.reservation.application.dto.ReservationResponse;
import com.dz.erp.inventory.reservation.domain.model.Reservation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReservationResponseMapper {
    @Mapping(target = "reservationType", expression = "java(r.getReservationType().name())")
    @Mapping(target = "status", expression = "java(r.getStatus().name())")
    ReservationResponse toResponse(Reservation r);
}

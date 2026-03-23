package com.dz.erp.pim.logistics.application.dto;

import java.time.Instant;

public record WilayaRestrictionResponse(
    String restrictionId,
    String wilayaCode,
    String reason,
    Instant restrictedAt,
    String restrictedBy
) {}

package com.dz.erp.catalog.category.application.dto;

import java.util.List;
import java.util.UUID;

public record CategoryTreeResponse(
    UUID id,
    String code,
    String nameFr,
    String nameAr,
    int position,
    boolean active,
    long productCount,
    List<CategoryTreeResponse> children
) {}

package com.dz.erp.catalog.category.application.dto;

import jakarta.validation.constraints.Size;
import java.util.Map;

public record UpdateCategoryCommand(
    String nameFr,
    String nameAr,
    String parentCode,
    @Size(max = 60) String metaTitleFr,
    @Size(max = 60) String metaTitleAr,
    String tvaCategoryCode,
    Map<String, Boolean> channelConfig,
    int position
) {}

package com.dz.erp.catalog.search.application.dto;

import java.util.List;

public record SearchSuggestResponse(
        List<String> suggestions
) {}

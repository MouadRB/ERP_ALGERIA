package com.dz.erp.catalog.search.application.dto;

public record SearchQueryCommand(
        String query,
        String category,
        String channel,
        int page,
        int size
) {
    public SearchQueryCommand {
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 25;
    }
}

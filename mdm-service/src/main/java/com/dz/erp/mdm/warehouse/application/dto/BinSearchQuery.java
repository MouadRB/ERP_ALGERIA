package com.dz.erp.mdm.warehouse.application.dto;
import com.dz.erp.mdm.warehouse.domain.model.BinStatus;
import com.dz.erp.mdm.warehouse.domain.model.BinType;
public record BinSearchQuery(String zone, BinType binType, BinStatus status, int page, int size) {
    public BinSearchQuery { if (size <= 0) size = 25; if (page < 0) page = 0; }
}

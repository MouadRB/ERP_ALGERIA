package com.dz.erp.mdm.wilaya.application.dto;
import com.dz.erp.mdm.wilaya.domain.model.WilayaStatus;
public record WilayaSearchQuery(String zone, Boolean deliverable, WilayaStatus status, int page, int size) {
    public WilayaSearchQuery { if (size <= 0) size = 25; if (page < 0) page = 0; }
}

package com.dz.erp.mdm.warehouse.application.dto;
public record UpdateBinCommand(String zone, String rack, String shelf, Integer maxCapacity, String binType, String notes) {}

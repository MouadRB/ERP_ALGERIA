package com.dz.erp.mdm.wilaya.application.dto;
public record UpdateWilayaCommand(String name, String nameAr, String zone, Integer deliveryCostDzd,
    String estimatedDays, Boolean deliverable, String notes) {}

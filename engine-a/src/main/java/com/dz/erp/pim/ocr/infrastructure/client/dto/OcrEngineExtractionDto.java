package com.dz.erp.pim.ocr.infrastructure.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OcrEngineExtractionDto(
        String bon_numero,
        String date,
        String time,
        String client,
        Integer colis,
        Integer condi,
        Integer qte,
        String designation,
        BigDecimal prix_vente,
        BigDecimal montant,
        BigDecimal total_montant,
        String raw_text,
        Boolean requires_manual_review,
        String error
) {}

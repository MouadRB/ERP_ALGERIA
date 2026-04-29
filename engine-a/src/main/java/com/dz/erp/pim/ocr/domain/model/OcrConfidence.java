package com.dz.erp.pim.ocr.domain.model;

public record OcrConfidence(int overall, int nameFr, int price, int cost, int category) {
    public static OcrConfidence empty() { return new OcrConfidence(0, 0, 0, 0, 0); }
}

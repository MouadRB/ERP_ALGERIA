package com.dz.erp.pim.ocr.infrastructure.client;

import com.dz.erp.pim.ocr.domain.port.OcrEngineClient;
import com.dz.erp.pim.ocr.infrastructure.client.dto.OcrEngineExtractionDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
public class HttpOcrEngineClient implements OcrEngineClient {

    private final RestClient client;
    private final ObjectMapper objectMapper;

    public HttpOcrEngineClient(@Qualifier("ocrRestClient") RestClient client,
                               ObjectMapper objectMapper) {
        this.client = client;
        this.objectMapper = objectMapper;
    }


    @Value("${app.ocr.extract-path:/extract-delivery-note}")
    private String extractPath;

    @Override
    public ExtractionResult extract(String fileName, String mimeType, byte[] content) {
        var resource = new ByteArrayResource(content) {
            @Override public String getFilename() { return fileName != null ? fileName : "upload.bin"; }
        };
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);

        var headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        OcrEngineExtractionDto raw = client.post()
                .uri(extractPath)
                .headers(h -> h.addAll(headers))
                .body(body)
                .retrieve()
                .body(OcrEngineExtractionDto.class);

        if (raw == null) {
            return new ExtractionResult(List.of(), null, true);
        }
        if (raw.error() != null) {
            log.warn("OCR engine returned error: {}", raw.error());
            return new ExtractionResult(List.of(), serialize(raw), true);
        }

        boolean review = Boolean.TRUE.equals(raw.requires_manual_review());
        int baseConfidence = review ? 60 : 90;

        var line = new ExtractedLine(
                raw.designation(),
                null,
                null,
                null,
                raw.qte() != null ? raw.qte() : (raw.colis()),
                raw.prix_vente(),
                deriveCost(raw.prix_vente(), raw.montant(), raw.qte()),
                baseConfidence,
                raw.designation() != null ? baseConfidence + 5 : 0,
                raw.prix_vente() != null ? baseConfidence : 0,
                raw.montant() != null ? baseConfidence - 10 : 0,
                0
        );
        return new ExtractionResult(List.of(line), serialize(raw), review);
    }

    private static BigDecimal deriveCost(BigDecimal salePrice, BigDecimal montant, Integer qte) {
        if (montant != null && qte != null && qte > 0)
            return montant.divide(BigDecimal.valueOf(qte), 4, java.math.RoundingMode.HALF_UP);
        return null;
    }

    private String serialize(Object o) {
        try { return objectMapper.writeValueAsString(o); }
        catch (Exception e) { return null; }
    }
}

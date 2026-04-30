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

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class HttpOcrEngineClient implements OcrEngineClient {

    private final RestClient client;
    private final ObjectMapper objectMapper;

    @Value("${app.ocr.extract-path:/extract-delivery-note}")
    private String extractPath;

    public HttpOcrEngineClient(@Qualifier("ocrRestClient") RestClient client,
                               ObjectMapper objectMapper) {
        this.client = client;
        this.objectMapper = objectMapper;
    }

    @Override
    public ExtractionResult extract(String fileName, String mimeType, byte[] content) {

        // ── 1. Build multipart body ──────────────────────────────────────────
        var resource = new ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return fileName != null ? fileName : "upload.bin";
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);

        var headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // ── 2. Call engine — accept raw bytes regardless of Content-Type ─────
        log.info("OCR call → POST {} ({} bytes, mime={})", extractPath, content.length, mimeType);
        byte[] responseBytes;
        try {
            responseBytes = client.post()
                    .uri(extractPath)
                    .headers(h -> h.addAll(headers))
                    .body(body)
                    .retrieve()
                    .body(byte[].class);
        } catch (Exception e) {
            log.error("OCR engine HTTP call failed: {}", e.toString(), e);
            return new ExtractionResult(List.of(), null, true, DocumentMeta.empty());
        }

        // ── 3. Guard: empty response ─────────────────────────────────────────
        if (responseBytes == null || responseBytes.length == 0) {
            log.warn("OCR engine returned an empty response (bytes={})",
                    responseBytes == null ? "null" : 0);
            return new ExtractionResult(List.of(), null, true, DocumentMeta.empty());
        }
        log.info("OCR response received ({} bytes), preview={}",
                responseBytes.length,
                new String(responseBytes, 0, Math.min(responseBytes.length, 200), java.nio.charset.StandardCharsets.UTF_8));

        // ── 4. Deserialize manually ──────────────────────────────────────────
        OcrEngineExtractionDto raw;
        try {
            raw = objectMapper.readValue(responseBytes, OcrEngineExtractionDto.class);
        } catch (Exception e) {
            log.error("Failed to parse OCR engine response: {}", e.toString(), e);
            return new ExtractionResult(List.of(), null, true, DocumentMeta.empty());
        }
        log.info("OCR parsed → designation={}, qte={}, prix_vente={}, montant={}, error={}",
                raw.designation(), raw.qte(), raw.prix_vente(), raw.montant(), raw.error());

        // ── 5. Build document-level metadata (always, even on engine error) ──
        DocumentMeta meta = buildDocumentMeta(raw);

        // ── 6. Engine-level error ────────────────────────────────────────────
        if (raw.error() != null) {
            log.warn("OCR engine returned error: {}", raw.error());
            return new ExtractionResult(List.of(), serialize(raw), true, meta);
        }

        // ── 7. Map to product line(s). Skip if no product fields at all. ─────
        boolean review = Boolean.TRUE.equals(raw.requires_manual_review());
        int baseConfidence = review ? 60 : 90;

        boolean hasProductData = raw.designation() != null || raw.qte() != null
                || raw.prix_vente() != null || raw.montant() != null;

        List<ExtractedLine> lines;
        if (!hasProductData) {
            log.info("OCR returned no product-line data — document metadata only");
            lines = List.of();
        } else {
            var line = new ExtractedLine(
                    raw.designation(),                                             // nameFr
                    null,                                                          // nameAr
                    null,                                                          // supplierCode
                    null,                                                          // categoryCode
                    raw.qte() != null ? raw.qte() : raw.colis(),                  // qty
                    raw.prix_vente(),                                              // salePrice
                    null,                                                          // costPrice — receipt has none
                    baseConfidence,                                                // confidenceOverall
                    raw.designation() != null ? baseConfidence + 5  : 0,          // confidenceNameFr
                    raw.prix_vente()  != null ? baseConfidence       : 0,          // confidencePrice
                    0,                                                             // confidenceCost
                    0                                                              // confidenceCategory
            );
            lines = List.of(line);
        }

        log.info("OCR engine extraction succeeded — review={}, lines={}, bonNumero={}, client={}",
                review, lines.size(), meta.bonNumero(), meta.clientName());

        return new ExtractionResult(lines, serialize(raw), review, meta);
    }

    // ── DocumentMeta builder with safe parsing + regex fallback ──────────────

    private static final Pattern DATE_PATTERN =
            Pattern.compile("(\\d{2})[/.\\-](\\d{2})[/.\\-](\\d{4})");
    private static final Pattern TIME_PATTERN =
            Pattern.compile("\\b(\\d{1,2})[:.](\\d{2})\\b");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private static DocumentMeta buildDocumentMeta(OcrEngineExtractionDto raw) {
        return new DocumentMeta(
                blankToNull(raw.bon_numero()),
                parseDate(raw.date(), raw.raw_text()),
                parseTime(raw.time(), raw.raw_text()),
                blankToNull(raw.client()),
                raw.colis(),
                raw.condi(),
                raw.total_montant() != null ? raw.total_montant() : raw.montant(),
                raw.raw_text());
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private static LocalDate parseDate(String value, String fallbackText) {
        if (value != null && !value.isBlank()) {
            try { return LocalDate.parse(value.trim(), DATE_FMT); } catch (Exception ignored) {}
        }
        if (fallbackText != null) {
            Matcher m = DATE_PATTERN.matcher(fallbackText);
            if (m.find()) {
                try { return LocalDate.of(Integer.parseInt(m.group(3)),
                        Integer.parseInt(m.group(2)), Integer.parseInt(m.group(1))); }
                catch (Exception ignored) {}
            }
        }
        return null;
    }

    private static LocalTime parseTime(String value, String fallbackText) {
        if (value != null && !value.isBlank()) {
            try { return LocalTime.parse(value.trim(), TIME_FMT); } catch (Exception ignored) {}
        }
        if (fallbackText != null) {
            Matcher m = TIME_PATTERN.matcher(fallbackText);
            if (m.find()) {
                try { return LocalTime.of(Integer.parseInt(m.group(1)), Integer.parseInt(m.group(2))); }
                catch (Exception ignored) {}
            }
        }
        return null;
    }

    private String serialize(Object o) {
        try {
            return objectMapper.writeValueAsString(o);
        } catch (Exception e) {
            log.warn("Failed to serialize OCR DTO: {}", e.getMessage());
            return null;
        }
    }
}
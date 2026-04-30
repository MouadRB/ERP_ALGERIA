package com.dz.erp.pim.ocr.application.mapper;

import com.dz.erp.pim.ocr.application.dto.OcrJobLineResponse;
import com.dz.erp.pim.ocr.application.dto.OcrJobResponse;
import com.dz.erp.pim.ocr.domain.model.OcrJob;
import com.dz.erp.pim.ocr.domain.model.OcrJobLine;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OcrJobMapper {

    public OcrJobResponse toResponse(OcrJob job) {
        List<OcrJobLineResponse> lines = job.getLines().stream().map(this::toLine).toList();
        int avg = lines.isEmpty() ? 0
                : (int) Math.round(lines.stream().mapToInt(OcrJobLineResponse::confidenceOverall).average().orElse(0));
        return new OcrJobResponse(
                job.getJobId(), job.getTenantId(), job.getFileName(), job.getMimeType(), job.getFileSizeBytes(),
                job.getStatus().name(), job.getProgressPercent(), job.getErrorMessage(),
                job.getCreatedBy(), job.getCreatedAt(), job.getCompletedAt(), avg,
                job.getBonNumero(), job.getDocumentDate(), job.getDocumentTime(),
                job.getClientName(), job.getNbrColis(), job.getNbrCondi(),
                job.getTotalMontant(), job.getRawText(),
                lines);
    }

    private OcrJobLineResponse toLine(OcrJobLine l) {
        var c = l.getConfidence();
        return new OcrJobLineResponse(l.getLineId(), l.getLineIndex(),
                l.getSkuCode(), l.getNameFr(), l.getNameAr(),
                l.getSupplierCode(), l.getCategoryCode(),
                l.getQty(), l.getSalePrice(), l.getCostPrice(),
                c.overall(), c.nameFr(), c.price(), c.cost(), c.category(),
                l.isAccepted(), l.getProductId());
    }
}

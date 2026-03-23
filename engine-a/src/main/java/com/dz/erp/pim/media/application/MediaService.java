package com.dz.erp.pim.media.application;

import com.dz.erp.pim.media.application.dto.*;
import com.dz.erp.pim.media.domain.model.*;
import com.dz.erp.pim.media.infrastructure.persistence.*;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MediaService {
    private final ProductMediaSpringDataRepository repo;

    @Transactional
    public MediaResponse upload(String productId, UploadMediaCommand cmd) {
        var tid = AuthContext.currentTenantId();
        if (repo.countByProductId(productId) >= 20) throw new BusinessException(ErrorCode.MEDIA_LIMIT_EXCEEDED);
        if (cmd.fileSizeBytes() > 5 * 1024 * 1024) throw new BusinessException(ErrorCode.MEDIA_TOO_LARGE);
        var media = new ProductMedia(productId, tid, cmd.fileName(), cmd.fileUrl(), cmd.fileSizeBytes(), cmd.mimeType(),
                cmd.mediaType() != null ? MediaType.valueOf(cmd.mediaType()) : MediaType.GALLERY);
        var e = new ProductMediaJpaEntity();
        e.setMediaId(media.getMediaId());
        e.setProductId(productId);
        e.setTenantId(tid);
        e.setFileName(cmd.fileName());
        e.setFileUrl(cmd.fileUrl());
        e.setFileSizeBytes(cmd.fileSizeBytes());
        e.setMimeType(cmd.mimeType());
        e.setMediaType(media.getMediaType());
        e.setStatus(media.getStatus());
        e.setCreatedAt(media.getCreatedAt());
        repo.save(e);
        return new MediaResponse(media.getMediaId(), productId, cmd.fileName(), cmd.fileUrl(), cmd.fileSizeBytes(), cmd.mimeType(), media.getMediaType().name(), media.getStatus().name(), media.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> list(String productId) {
        return repo.findByProductIdOrderBySortOrder(productId).stream().map(e -> new MediaResponse(e.getMediaId(), e.getProductId(), e.getFileName(), e.getFileUrl(), e.getFileSizeBytes(), e.getMimeType(), e.getMediaType().name(), e.getStatus().name(), e.getCreatedAt())).toList();
    }

    @Transactional
    public void delete(String mediaId) {
        repo.deleteById(mediaId);
    }
}

package com.dz.erp.pim.media.application.dto;
public record UploadMediaCommand(String fileName, String fileUrl, long fileSizeBytes, String mimeType, String mediaType) {}

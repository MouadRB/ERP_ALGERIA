package com.dz.erp.pim.ocr.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CommitOcrJobCommand(@NotEmpty @Valid List<CommitOcrLine> lines) {}

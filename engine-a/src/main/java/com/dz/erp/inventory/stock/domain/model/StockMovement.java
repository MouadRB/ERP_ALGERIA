package com.dz.erp.inventory.stock.domain.model;

import lombok.Getter;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Getter
public class StockMovement {
    private final String movementId;
    private final String tenantId;
    private final String stockRecordId;
    private final String skuCode;
    private final MovementType movementType;
    private final int quantityChange;
    private final int quantityBefore;
    private final int quantityAfter;
    private final BigDecimal unitCost;
    private final BigDecimal totalCost;
    private final String referenceType;
    private final String referenceId;
    private final String reason;
    private final String fifoLayerId;
    private final String performedBy;
    private final Instant performedAt;
    private final String auditHash;
    private final String previousHash;

    // No setters -- fully immutable. Factory only.
    public static StockMovement create(String tenantId, String stockRecordId, String skuCode,
                                       MovementType movementType, int quantityChange,
                                       int quantityBefore, int quantityAfter,
                                       BigDecimal unitCost, BigDecimal totalCost,
                                       String referenceType, String referenceId,
                                       String reason, String fifoLayerId,
                                       String performedBy, String previousHash) {
        var id = UUID.randomUUID().toString();
        var now = Instant.now();
        var hash = computeHash(id, skuCode, movementType.name(),
                String.valueOf(quantityChange), now.toString(),
                previousHash != null ? previousHash : "GENESIS");
        return new StockMovement(id, tenantId, stockRecordId, skuCode, movementType,
                quantityChange, quantityBefore, quantityAfter, unitCost, totalCost,
                referenceType, referenceId, reason, fifoLayerId,
                performedBy, now, hash, previousHash);
    }

    public static StockMovement reconstitute(
            String movementId, String tenantId, String stockRecordId, String skuCode,
            MovementType movementType, int quantityChange, int quantityBefore, int quantityAfter,
            BigDecimal unitCost, BigDecimal totalCost, String referenceType, String referenceId,
            String reason, String fifoLayerId, String performedBy, Instant performedAt,
            String auditHash, String previousHash) {
        return new StockMovement(movementId, tenantId, stockRecordId, skuCode, movementType,
                quantityChange, quantityBefore, quantityAfter, unitCost, totalCost,
                referenceType, referenceId, reason, fifoLayerId,
                performedBy, performedAt, auditHash, previousHash);
    }

    private StockMovement(String movementId, String tenantId, String stockRecordId, String skuCode,
                          MovementType movementType, int quantityChange, int quantityBefore,
                          int quantityAfter, BigDecimal unitCost, BigDecimal totalCost,
                          String referenceType, String referenceId, String reason, String fifoLayerId,
                          String performedBy, Instant performedAt, String auditHash, String previousHash) {
        this.movementId = movementId;
        this.tenantId = tenantId;
        this.stockRecordId = stockRecordId;
        this.skuCode = skuCode;
        this.movementType = movementType;
        this.quantityChange = quantityChange;
        this.quantityBefore = quantityBefore;
        this.quantityAfter = quantityAfter;
        this.unitCost = unitCost;
        this.totalCost = totalCost;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.reason = reason;
        this.fifoLayerId = fifoLayerId;
        this.performedBy = performedBy;
        this.performedAt = performedAt;
        this.auditHash = auditHash;
        this.previousHash = previousHash;
    }

    private static String computeHash(String... fields) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            var input = String.join("|", fields);
            var bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}

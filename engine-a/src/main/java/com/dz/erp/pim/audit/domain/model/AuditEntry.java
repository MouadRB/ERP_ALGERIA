package com.dz.erp.pim.audit.domain.model;

import lombok.Getter;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Getter
public class AuditEntry {
    private final String auditId;
    private final String productId;
    private final String tenantId;
    private final String action;
    private final String description;
    private final String actorId;
    private final String actorName;
    private final Instant occurredAt;
    private final String previousHash;
    private final String currentHash;

    public AuditEntry(String productId, String tenantId, String action, String description,
                      String actorId, String actorName, String previousHash) {
        this.auditId = UUID.randomUUID().toString();
        this.productId = productId;
        this.tenantId = tenantId;
        this.action = action;
        this.description = description;
        this.actorId = actorId;
        this.actorName = actorName;
        this.occurredAt = Instant.now();
        this.previousHash = previousHash;
        this.currentHash = computeHash();
    }


    private String computeHash() {
        try {
            var data = action + description + actorId + occurredAt + (previousHash != null ? previousHash : "GENESIS");
            var digest = MessageDigest.getInstance("SHA-256").digest(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("Hash computation failed", e);
        }
    }
}

package com.dz.erp.oms.integration.infrastructure.carrier.base;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Constant-time HMAC-SHA256 comparison helpers shared by every carrier webhook
 * verifier. Each verifier picks its own header name and payload canonicalization;
 * the algorithm itself is the standard building block.
 */
public final class HmacSignatureUtil {

    private HmacSignatureUtil() {}

    /** HMAC-SHA256 → lowercase hex. */
    public static String hmacSha256Hex(String secret, String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("HMAC-SHA256 unavailable", e);
        }
    }

    /** Constant-time comparison. Returns false on any length mismatch. */
    public static boolean safeEquals(String a, String b) {
        if (a == null || b == null) return false;
        byte[] x = a.getBytes(StandardCharsets.UTF_8);
        byte[] y = b.getBytes(StandardCharsets.UTF_8);
        if (x.length != y.length) return false;
        return MessageDigest.isEqual(x, y);
    }
}

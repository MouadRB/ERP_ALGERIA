package com.dz.erp.shared.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class JwtGenerator {
    public static void main(String[] args) {
        String secret = "changeme-in-production-use-256-bit-minimum-key-here-please"; // Secret من مشروعك
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> claims = new HashMap<>();
        claims.put("username", "admin");
        claims.put("roles", List.of("SUPER_ADMIN"));  // Array مهم للفلتر
        claims.put("tenant_id", "default");

        String jwt = Jwts.builder()
                .setClaims(claims)
                .setSubject("user1222qd222222")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600_000)) // صلاحية ساعة
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        System.out.println("JWT Token: " + jwt);
    }
}
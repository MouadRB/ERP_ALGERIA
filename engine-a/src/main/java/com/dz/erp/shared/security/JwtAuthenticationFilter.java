package com.dz.erp.shared.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final SecretKey signingKey;
    private final String keycloakIssuer;
    private final String keycloakClientId;
    private final ConfigurableJWTProcessor<SecurityContext> keycloakJwtProcessor;

    private static final Map<String, String> ROLE_ALIASES = Map.ofEntries(
            Map.entry("SUPERADMIN", "SUPER_ADMIN"),
            Map.entry("FINANCE_DIRECTOR", "FINANCE_MANAGER"),
            Map.entry("OMS_OPERATOR", "SALES_MANAGER"),
            Map.entry("ANALYST", "REPORTING_ANALYST")
    );

    public JwtAuthenticationFilter(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.keycloak.issuer:http://localhost:8180/realms/ferza}") String keycloakIssuer,
            @Value("${app.security.keycloak.jwks-uri:http://localhost:8180/realms/ferza/protocol/openid-connect/certs}") String keycloakJwksUri,
            @Value("${app.security.keycloak.client-id:ferza-bff}") String keycloakClientId
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.keycloakIssuer = keycloakIssuer;
        this.keycloakClientId = keycloakClientId;
        this.keycloakJwtProcessor = buildKeycloakProcessor(keycloakJwksUri);
    }

    private ConfigurableJWTProcessor<SecurityContext> buildKeycloakProcessor(String jwksUri) {
        try {
            ConfigurableJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();
            JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(new URL(jwksUri));
            JWSKeySelector<SecurityContext> selector =
                    new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
            processor.setJWSKeySelector(selector);
            return processor;
        } catch (Exception ex) {
            throw new IllegalStateException("Invalid Keycloak JWKS URI: " + jwksUri, ex);
        }
    }

    private static String normalizeRole(String role) {
        if (role == null || role.isBlank()) return role;
        return ROLE_ALIASES.getOrDefault(role, role);
    }

    private void authenticateWithHmacToken(String jwt) {
        var claims = Jwts.parser().verifyWith(signingKey).build()
                .parseSignedClaims(jwt).getPayload();

        String tenantId = claims.get("tenant_id", String.class);
        TenantContext.setTenantId(tenantId != null ? tenantId : "default");

        @SuppressWarnings("unchecked")
        List<String> roleList = claims.get("roles", List.class);
        Set<String> roles = new HashSet<>();
        if (roleList != null) {
            roleList.stream().map(JwtAuthenticationFilter::normalizeRole).forEach(roles::add);
        }

        var user = new SecurityUser(claims.getSubject(), TenantContext.getTenantId(),
                claims.get("username", String.class), roles);

        var authorities = roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, jwt, authorities));
    }

    @SuppressWarnings("unchecked")
    private void authenticateWithKeycloakToken(String jwt) throws Exception {
        JWTClaimsSet claims = keycloakJwtProcessor.process(SignedJWT.parse(jwt), null);

        if (!keycloakIssuer.equals(claims.getIssuer())) {
            throw new IllegalArgumentException("Unexpected issuer");
        }

        List<String> aud = claims.getAudience() != null ? claims.getAudience() : List.of();
        String azp = claims.getStringClaim("azp");
        if (!aud.contains(keycloakClientId) && !Objects.equals(azp, keycloakClientId)) {
            throw new IllegalArgumentException("Token not issued for configured client");
        }

        Map<String, Object> realmAccess = (Map<String, Object>) claims.getClaim("realm_access");
        List<String> roleList = realmAccess != null && realmAccess.get("roles") instanceof List<?> list
                ? list.stream().map(String::valueOf).toList()
                : List.of();

        Set<String> roles = new HashSet<>();
        roleList.stream().map(JwtAuthenticationFilter::normalizeRole).forEach(roles::add);

        String tenantId = Optional.ofNullable(claims.getStringClaim("tenant_id")).orElse("default");
        TenantContext.setTenantId(tenantId);
        String username = Optional.ofNullable(claims.getStringClaim("preferred_username"))
                .orElse(claims.getSubject());

        var user = new SecurityUser(claims.getSubject(), TenantContext.getTenantId(), username, roles);
        var authorities = roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, jwt, authorities));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String path = req.getServletPath();
        if (path.startsWith("/v3/api-docs") || path.startsWith("/swagger-ui")) {
            chain.doFilter(req, res);
            return;
        }
        try {
            String header = req.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String jwt = header.substring(7);
                try {
                    authenticateWithHmacToken(jwt);
                } catch (Exception ignored) {
                    authenticateWithKeycloakToken(jwt);
                }
            }
        } catch (Exception ex) {
            log.debug("Invalid JWT: {}", ex.getMessage());
        } finally {
            try { chain.doFilter(req, res); }
            finally { TenantContext.clear(); SecurityContextHolder.clearContext(); }
        }
    }
}
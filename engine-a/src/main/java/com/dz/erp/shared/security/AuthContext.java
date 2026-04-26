package com.dz.erp.shared.security;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class AuthContext {
    public static SecurityUser currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof SecurityUser u) return u;
        throw new IllegalStateException("No authenticated user");
    }
    public static String currentUserId()   { return currentUser().userId(); }
    public static String currentTenantId() { return TenantContext.getTenantId(); }
    public static String getJwt() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getCredentials() instanceof String jwt) return jwt;
        throw new IllegalStateException("No JWT token available");
    }
}

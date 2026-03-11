package com.dz.erp.shared.security;

import java.util.Set;

public record SecurityUser(String userId, String tenantId, String username, Set<String> roles) {
    public boolean hasRole(String role) { return roles.contains(role); }
}

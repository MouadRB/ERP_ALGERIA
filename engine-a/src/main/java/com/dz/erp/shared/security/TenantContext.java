package com.dz.erp.shared.security;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class TenantContext {
    private static final ThreadLocal<String> CURRENT = ThreadLocal.withInitial(() -> "default");
    public static String getTenantId()          { return CURRENT.get(); }
    public static void   setTenantId(String id) { CURRENT.set(id); }
    public static void   clear()                { CURRENT.remove(); }
}

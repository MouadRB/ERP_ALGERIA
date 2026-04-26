namespace engine_b.Common.Multitenancy;

/// <summary>
/// Resolves the active tenant for the current HTTP request and stores it in the
/// scoped <see cref="TenantContext"/>. Resolution order:
/// <list type="number">
///   <item>JWT claim <c>tenant_id</c> (the source of truth — issued by every engine).</item>
///   <item>Request header <c>X-Tenant-Id</c> (used by service-to-service calls).</item>
///   <item>Falls back to <see cref="TenantContext.DefaultTenant"/>.</item>
/// </list>
/// </summary>
public class TenantMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, TenantContext tenant)
    {
        var fromClaim = context.User?.FindFirst(TenantContext.TenantClaimType)?.Value;
        var fromHeader = context.Request.Headers.TryGetValue(TenantContext.TenantHeader, out var hdr)
            ? hdr.ToString()
            : null;

        tenant.TenantId = !string.IsNullOrWhiteSpace(fromClaim) ? fromClaim!
                       : !string.IsNullOrWhiteSpace(fromHeader) ? fromHeader!
                       : TenantContext.DefaultTenant;

        context.Items[nameof(TenantContext)] = tenant;
        await next(context);
    }
}

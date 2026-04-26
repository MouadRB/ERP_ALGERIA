using engine_b.Common.Multitenancy;
using Microsoft.AspNetCore.Identity;

namespace engine_b.Modules.Identity.Domain;

public class AppUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Tenant the user belongs to. Mirrors the <c>tenant_id</c> claim that
    /// engine-a / mdm read from JWTs and propagates the principle into engine-b.
    /// </summary>
    public string TenantId { get; set; } = TenantContext.DefaultTenant;
}

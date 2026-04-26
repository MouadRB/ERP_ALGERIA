namespace engine_b.Common.Multitenancy;

/// <summary>
/// Per-request tenant scope. Mirror of engine-a/mdm <c>TenantContext</c> so the
/// three services share one mental model: every authenticated request carries a
/// tenant identifier, and every module reads the active tenant through this type.
/// </summary>
public class TenantContext
{
    public const string DefaultTenant = "default";
    public const string TenantClaimType = "tenant_id";
    public const string TenantHeader = "X-Tenant-Id";

    private string _tenantId = DefaultTenant;

    public string TenantId
    {
        get => _tenantId;
        set => _tenantId = string.IsNullOrWhiteSpace(value) ? DefaultTenant : value;
    }

    public bool IsDefault => string.Equals(_tenantId, DefaultTenant, StringComparison.Ordinal);
}

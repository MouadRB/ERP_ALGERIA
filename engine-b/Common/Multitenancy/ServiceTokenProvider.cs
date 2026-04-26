using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using engine_b.Modules.Identity.Application.Services;
using engine_b.Modules.Identity.Domain;
using Microsoft.IdentityModel.Tokens;

namespace engine_b.Common.Multitenancy;

/// <summary>
/// Issues short-lived service-account JWTs that engine-b uses when calling
/// engine-a / mdm-service (and that engine-b's outbox dispatcher attaches as a
/// Bearer header). Tokens carry the <c>INTERNAL_SYSTEM</c> role and a tenant_id
/// so the receiving side passes its <c>InternalSystem</c> / role checks.
/// </summary>
public interface IServiceTokenProvider
{
    string Current();
}

public class ServiceTokenProvider(IConfiguration configuration) : IServiceTokenProvider
{
    private const int RefreshSkewSeconds = 300; // refresh 5 min before expiry
    private string? _cached;
    private DateTime _expiresAtUtc = DateTime.MinValue;
    private readonly object _lock = new();

    public string Current()
    {
        if (_cached is not null && DateTime.UtcNow < _expiresAtUtc.AddSeconds(-RefreshSkewSeconds))
            return _cached;

        lock (_lock)
        {
            if (_cached is not null && DateTime.UtcNow < _expiresAtUtc.AddSeconds(-RefreshSkewSeconds))
                return _cached;

            var jwt = configuration.GetSection("Jwt");
            var sharedSecret = Environment.GetEnvironmentVariable("ERP_JWT_SECRET")
                             ?? jwt["Key"]!;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(sharedSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            _expiresAtUtc = DateTime.UtcNow.AddMinutes(60);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, "engine-b-service"),
                new("username", "engine-b-service"),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(TenantContext.TenantClaimType, TenantContext.DefaultTenant),
                // Dual-format roles — same convention as TokenService.
                new(ClaimTypes.Role, AppRoleNames.SuperAdmin),
                new("roles", "SUPER_ADMIN"),
                new(ClaimTypes.Role, "INTERNAL_SYSTEM"),
                new("roles", "INTERNAL_SYSTEM"),
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: _expiresAtUtc,
                signingCredentials: creds);

            _cached = new JwtSecurityTokenHandler().WriteToken(token);
            return _cached;
        }
    }
}

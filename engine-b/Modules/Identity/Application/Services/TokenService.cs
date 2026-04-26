using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using engine_b.Common.Multitenancy;
using engine_b.Modules.Identity.Application.Dtos;
using engine_b.Modules.Identity.Domain;
using Microsoft.IdentityModel.Tokens;

namespace engine_b.Modules.Identity.Application.Services;

public class TokenService(IConfiguration configuration)
{
    public AuthResponse CreateToken(AppUser user, IList<string> roles, string? tenantId = null)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var sharedSecret = Environment.GetEnvironmentVariable("ERP_JWT_SECRET")
                         ?? jwtSettings["Key"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(sharedSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresInMinutes = int.Parse(jwtSettings["ExpiresInMinutes"] ?? "60");
        var expiry = DateTime.UtcNow.AddMinutes(expiresInMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, user.UserName!),
            new("username", user.UserName!),
            new(TenantContext.TenantClaimType, tenantId ?? TenantContext.DefaultTenant),
        };

        // Dual-format role claims: PascalCase for engine-b's own [Authorize(Roles=...)]
        // and UPPER_SNAKE under the custom "roles" claim that engine-a / mdm consume.
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
            claims.Add(new Claim("roles", ToUpperSnake(role)));
        }

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: credentials);

        return new AuthResponse(new JwtSecurityTokenHandler().WriteToken(token), expiry);
    }

    /// <summary>
    /// "SuperAdmin" → "SUPER_ADMIN", "CRMAgent" → "CRM_AGENT".
    /// Mirrors the convention used by engine-a's <c>Roles</c> constants.
    /// </summary>
    public static string ToUpperSnake(string value)
    {
        if (string.IsNullOrEmpty(value)) return value;
        var sb = new StringBuilder(value.Length + 4);
        for (int i = 0; i < value.Length; i++)
        {
            char c = value[i];
            if (i > 0 && char.IsUpper(c) && !char.IsUpper(value[i - 1]))
                sb.Append('_');
            sb.Append(char.ToUpperInvariant(c));
        }
        return sb.ToString();
    }
}

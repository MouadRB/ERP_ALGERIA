using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace engine_b.Common.Multitenancy;

/// <summary>
/// Engine-A and MDM emit role names under a custom <c>roles</c> claim using
/// UPPER_SNAKE_CASE (e.g. <c>SUPER_ADMIN</c>, <c>INVENTORY_MANAGER</c>).
/// Engine-B's authorization policies evaluate <see cref="ClaimTypes.Role"/>.
/// This transformer copies every <c>roles</c> claim into <see cref="ClaimTypes.Role"/>
/// (without losing the original) so policies like <c>RequireRole("SUPER_ADMIN")</c>
/// match tokens issued by any of the three engines.
/// </summary>
public class RolesClaimsTransformer : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
            return Task.FromResult(principal);

        var rolesAsCustom = identity.FindAll("roles").Select(c => c.Value).ToList();
        if (rolesAsCustom.Count == 0)
            return Task.FromResult(principal);

        var existing = identity.FindAll(ClaimTypes.Role).Select(c => c.Value).ToHashSet(StringComparer.Ordinal);
        foreach (var role in rolesAsCustom)
        {
            if (!string.IsNullOrWhiteSpace(role) && existing.Add(role))
                identity.AddClaim(new Claim(ClaimTypes.Role, role));
        }

        return Task.FromResult(principal);
    }
}

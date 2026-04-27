using System.Security.Cryptography;
using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Identity.Application.Dtos;
using engine_b.Modules.Identity.Application.Services;
using engine_b.Modules.Identity.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Identity.Api;

[ApiController]
[Route("api/tenants/{tenantId}/invites")]
[Authorize(Roles = AppRoleNames.SuperAdmin)]
public class TenantInvitesController(
    AppDbContext db,
    UserManager<AppUser> userManager) : ControllerBase
{
    /// <summary>Invite a coworker by email or assign roles immediately if they already have an account in this tenant.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateOrAssign(
        [FromRoute] string tenantId,
        [FromBody] CreateTenantInviteRequest request)
    {
        var tid = AuthService.NormalizeTenantId(tenantId);
        if (string.IsNullOrEmpty(tid))
            return BadRequest(new { error = "tenantId is required." });

        var caller = await userManager.GetUserAsync(User);
        if (caller is null || !string.Equals(caller.TenantId, tid, StringComparison.Ordinal))
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { error = "Email is required." });

        var emailNorm = AuthService.NormalizeInviteEmail(request.Email);
        if (string.IsNullOrEmpty(emailNorm) || !request.Email.Contains('@', StringComparison.Ordinal))
            return BadRequest(new { error = "Invalid email." });

        var roles = NormalizeAssignableRoles(request.Roles);
        if (roles.Count == 0)
            return BadRequest(new { error = "Provide at least one valid role (SuperAdmin cannot be assigned via invite)." });

        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
        {
            if (!string.Equals(existing.TenantId, tid, StringComparison.Ordinal))
                return BadRequest(new { error = "This email is already registered under a different company." });

            foreach (var role in roles)
            {
                if (!await userManager.IsInRoleAsync(existing, role))
                {
                    var add = await userManager.AddToRoleAsync(existing, role);
                    if (!add.Succeeded)
                    {
                        var err = string.Join("; ", add.Errors.Select(e => e.Description));
                        return BadRequest(new { error = $"Failed to add role '{role}': {err}" });
                    }
                }
            }

            return Ok(new { assigned = true, email = request.Email, tenantId = tid, roles });
        }

        var pending = await db.TenantInvitations
            .Where(i => i.TenantId == tid && i.Email == emailNorm && i.AcceptedAt == null && i.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();
        db.TenantInvitations.RemoveRange(pending);

        var plainTokenBytes = new byte[32];
        RandomNumberGenerator.Fill(plainTokenBytes);
        var plainToken = Convert.ToHexString(plainTokenBytes);
        var tokenHash = AuthService.HashInviteToken(plainToken);

        var invitation = new TenantInvitation
        {
            TenantId = tid,
            Email = emailNorm,
            RolesCsv = string.Join(',', roles),
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            InvitedByUserId = caller.Id,
        };

        db.TenantInvitations.Add(invitation);
        await db.SaveChangesAsync();

        var response = new TenantInviteResponse(request.Email, tid, plainToken, invitation.ExpiresAt);
        return Ok(response);
    }

    private static List<string> NormalizeAssignableRoles(IReadOnlyList<string> roles)
    {
        var allowed = AppRoleNames.AllRoles.ToHashSet(StringComparer.Ordinal);
        return roles
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim())
            .Distinct(StringComparer.Ordinal)
            .Where(r => allowed.Contains(r) && r != AppRoleNames.SuperAdmin)
            .ToList();
    }
}

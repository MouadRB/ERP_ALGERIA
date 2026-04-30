using System.Security.Claims;
using System.Security.Cryptography;
using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Identity.Application.Dtos;
using engine_b.Modules.Identity.Application.Services;
using engine_b.Modules.Identity.Domain;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Identity.Api;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController(
    AuthService authService,
    UserManager<AppUser> userManager,
    TokenService tokenService,
    AppDbContext db) : ControllerBase
{
    /// <summary>Register: first user for a tenant becomes SuperAdmin; others need an invite token from their Super Admin.</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var response = await authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Login with email, password, and company id (tenantId).</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await authService.LoginAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    // ─── Google OAuth ─────────────────────────────────────────────────────────

    /// <summary>Redirects to Google. Pass <c>tenantId</c> (required). For new users, pass <c>inviteToken</c> from the Super Admin invite response.</summary>
    [HttpGet("google")]
    public IActionResult GoogleLogin([FromQuery] string tenantId, [FromQuery] string? inviteToken = null)
    {
        var tid = AuthService.NormalizeTenantId(tenantId);
        if (string.IsNullOrEmpty(tid))
            return BadRequest(new { error = "tenantId query parameter is required." });

        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(GoogleCallback)),
        };
        properties.Items["tenant_id"] = tid;
        if (!string.IsNullOrWhiteSpace(inviteToken))
            properties.Items["invite_token"] = inviteToken.Trim();

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    /// <summary>Google callback — returns JWT scoped to the tenant from the login request.</summary>
    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
        if (!result.Succeeded)
            return Unauthorized(new { error = "Google authentication failed." });

        var tenantId = result.Properties?.Items.TryGetValue("tenant_id", out var tid) == true ? tid : null;
        tenantId = AuthService.NormalizeTenantId(tenantId ?? string.Empty);
        if (string.IsNullOrEmpty(tenantId))
            return BadRequest(new { error = "tenant_id was missing from the OAuth state. Call /api/auth/google?tenantId=..." });

        var email = result.Principal?.FindFirstValue(ClaimTypes.Email);
        var name = result.Principal?.FindFirstValue(ClaimTypes.Name);
        var googleSub = result.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(email))
            return BadRequest(new { error = "Could not retrieve email from Google." });

        var emailNorm = AuthService.NormalizeInviteEmail(email);

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            if (result.Properties?.Items.TryGetValue("invite_token", out var plainInvite) != true
                || string.IsNullOrWhiteSpace(plainInvite))
            {
                return BadRequest(new
                {
                    error = "New Google accounts require inviteToken on the initial /api/auth/google request (same token returned when inviting by email).",
                });
            }

            var hash = AuthService.HashInviteToken(plainInvite.Trim());
            var invite = await db.TenantInvitations
                .Where(i => i.TenantId == tenantId
                            && i.Email == emailNorm
                            && i.TokenHash == hash
                            && i.AcceptedAt == null
                            && i.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(i => i.CreatedAt)
                .FirstOrDefaultAsync();

            if (invite is null)
                return BadRequest(new { error = "Invalid or expired invitation for this Google account." });

            var invitedRoles = invite.RolesCsv
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(r => AppRoleNames.AllRoles.Contains(r) && r != AppRoleNames.SuperAdmin)
                .Distinct(StringComparer.Ordinal)
                .ToList();

            if (invitedRoles.Count == 0)
                return BadRequest(new { error = "Invitation has no assignable roles." });

            user = new AppUser
            {
                UserName = email,
                Email = email,
                FullName = name ?? email,
                EmailConfirmed = true,
                TenantId = tenantId,
            };

            var pwd = GenerateRandomPassword();
            var createResult = await userManager.CreateAsync(user, pwd);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                return BadRequest(new { error = $"User creation failed: {errors}" });
            }

            foreach (var role in invitedRoles)
            {
                if (!await userManager.IsInRoleAsync(user, role))
                {
                    var add = await userManager.AddToRoleAsync(user, role);
                    if (!add.Succeeded)
                        return BadRequest(new { error = $"Failed to assign role '{role}'." });
                }
            }

            if (!string.IsNullOrEmpty(googleSub))
            {
                await userManager.AddLoginAsync(user,
                    new UserLoginInfo(GoogleDefaults.AuthenticationScheme, googleSub, "Google"));
            }

            invite.AcceptedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }
        else
        {
            if (!string.Equals(user.TenantId, tenantId, StringComparison.Ordinal))
            {
                return BadRequest(new
                {
                    error = "tenantId does not match this account's company. Use the same tenantId you registered with.",
                });
            }
        }

        var roles = await userManager.GetRolesAsync(user);
        var authResponse = tokenService.CreateToken(user, roles, user.TenantId);
        return Ok(authResponse);
    }

    private static string GenerateRandomPassword()
    {
        return $"Aa1!{Convert.ToHexString(RandomNumberGenerator.GetBytes(16))}";
    }
}

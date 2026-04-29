using System.Security.Cryptography;
using engine_b.Common.Email;
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
    UserManager<AppUser> userManager,
    IEmailService emailService) : ControllerBase
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

        // ── Send invitation email ────────────────────────────────────────────
        var rolesDisplay = string.Join(", ", roles);
        var subject = $"You've been invited to join {tid} on ERP Algeria";
        var htmlBody = BuildInvitationEmailBody(
            recipientEmail: request.Email,
            tenantId: tid,
            inviteToken: plainToken,
            roles: rolesDisplay,
            expiresAt: invitation.ExpiresAt,
            inviterName: caller.FullName ?? caller.Email ?? "your administrator"
        );

        await emailService.SendAsync(request.Email, subject, htmlBody);
        // ─────────────────────────────────────────────────────────────────────

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

    /// <summary>
    /// Builds a styled HTML email body for the tenant invitation.
    /// </summary>
    private static string BuildInvitationEmailBody(
        string recipientEmail,
        string tenantId,
        string inviteToken,
        string roles,
        DateTime expiresAt,
        string inviterName)
    {
        return $$"""
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">ERP Algeria</h1>
                    <p style="margin:8px 0 0;color:#bbdefb;font-size:14px;">Team Invitation</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 16px;font-size:16px;color:#333;">Hello,</p>
                    <p style="margin:0 0 24px;font-size:16px;color:#333;">
                      <strong>{{inviterName}}</strong> has invited you to join company
                      <strong>{{tenantId}}</strong> on ERP Algeria.
                    </p>

                    <!-- Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e0e4ea;margin-bottom:24px;">
                      <tr>
                        <td style="padding:24px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:6px 0;color:#666;font-size:14px;width:140px;">Email</td>
                              <td style="padding:6px 0;color:#222;font-size:14px;font-weight:600;">{{recipientEmail}}</td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0;color:#666;font-size:14px;">Assigned Roles</td>
                              <td style="padding:6px 0;color:#222;font-size:14px;font-weight:600;">{{roles}}</td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0;color:#666;font-size:14px;">Company (Tenant)</td>
                              <td style="padding:6px 0;color:#222;font-size:14px;font-weight:600;">{{tenantId}}</td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0;color:#666;font-size:14px;">Expires</td>
                              <td style="padding:6px 0;color:#222;font-size:14px;font-weight:600;">{{expiresAt:yyyy-MM-dd HH:mm}} UTC</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Token -->
                    <p style="margin:0 0 8px;font-size:14px;color:#666;">Your invitation token:</p>
                    <div style="background:#eef3fc;border:1px dashed #1a73e8;border-radius:6px;padding:16px;text-align:center;margin-bottom:24px;">
                      <code style="font-size:15px;color:#1a73e8;word-break:break-all;letter-spacing:0.5px;">{{inviteToken}}</code>
                    </div>

                    <p style="margin:0 0 24px;font-size:14px;color:#555;">
                      Use this token when registering your account. Copy it and paste it into the
                      <strong>Invitation Token</strong> field on the registration page.
                    </p>

                    <!-- Divider -->
                    <hr style="border:none;border-top:1px solid #e0e4ea;margin:24px 0;">
                    <p style="margin:0;font-size:12px;color:#999;">
                      If you did not expect this invitation, you can safely ignore this email.
                      This token will expire on {{expiresAt:yyyy-MM-dd}} UTC.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#fafbfc;padding:20px 40px;text-align:center;border-top:1px solid #e0e4ea;">
                    <p style="margin:0;font-size:12px;color:#aaa;">&copy; ERP Algeria. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;
    }
}

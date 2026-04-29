using System.Security.Cryptography;
using System.Text;
using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Identity.Application.Dtos;
using engine_b.Modules.Identity.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Identity.Application.Services;

public class AuthService(
    AppDbContext db,
    UserManager<AppUser> userManager,
    RoleManager<AppRole> roleManager,
    TokenService tokenService)
{
    public static string NormalizeTenantId(string tenantId) =>
        string.IsNullOrWhiteSpace(tenantId) ? string.Empty : tenantId.Trim();

    public static string NormalizeInviteEmail(string email) =>
        string.IsNullOrWhiteSpace(email) ? string.Empty : email.Trim().ToLowerInvariant();

    public static string HashInviteToken(string plainToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainToken));
        return Convert.ToHexString(bytes);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var tenantId = NormalizeTenantId(request.TenantId);
        if (string.IsNullOrEmpty(tenantId))
            throw new InvalidOperationException("TenantId (company id) is required.");

        var emailNorm = NormalizeInviteEmail(request.Email);

        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
            throw new InvalidOperationException("A user with this email already exists.");

        var tenantUserCount = await db.Set<AppUser>().CountAsync(u => u.TenantId == tenantId);

        if (tenantUserCount == 0)
        {
            var user = new AppUser
            {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName,
                TenantId = tenantId,
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Registration failed: {errors}");
            }

            await EnsureRoleExistsAsync(AppRoleNames.SuperAdmin);
            await userManager.AddToRoleAsync(user, AppRoleNames.SuperAdmin);

            var roles = await userManager.GetRolesAsync(user);
            return tokenService.CreateToken(user, roles, user.TenantId);
        }

        if (string.IsNullOrWhiteSpace(request.InviteToken))
            throw new InvalidOperationException("An invitation is required to join this company. Ask your Super Admin.");

        var tokenHash = HashInviteToken(request.InviteToken.Trim());
        var invite = await db.TenantInvitations
            .Where(i => i.TenantId == tenantId
                        && i.Email == emailNorm
                        && i.TokenHash == tokenHash
                        && i.AcceptedAt == null
                        && i.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefaultAsync();

        if (invite is null)
            throw new InvalidOperationException("Invalid or expired invitation.");

        var invitedRoles = ParseAndValidateInvitedRoles(invite.RolesCsv);
        if (invitedRoles.Count == 0)
            throw new InvalidOperationException("Invitation has no valid roles.");

        var newUser = new AppUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            TenantId = tenantId,
        };

        var createResult = await userManager.CreateAsync(newUser, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Registration failed: {errors}");
        }

        foreach (var role in invitedRoles)
        {
            await EnsureRoleExistsAsync(role);
            var add = await userManager.AddToRoleAsync(newUser, role);
            if (!add.Succeeded)
            {
                var err = string.Join("; ", add.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to assign role '{role}': {err}");
            }
        }

        invite.AcceptedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        newUser = (await userManager.FindByIdAsync(newUser.Id.ToString()))!;
        var assignedRoles = await userManager.GetRolesAsync(newUser);
        return tokenService.CreateToken(newUser, assignedRoles, newUser.TenantId);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var tenantId = NormalizeTenantId(request.TenantId);
        if (string.IsNullOrEmpty(tenantId))
            throw new InvalidOperationException("TenantId (company id) is required.");

        var user = await userManager.FindByEmailAsync(request.Email)
            ?? throw new InvalidOperationException("Invalid email or password.");

        if (!string.Equals(user.TenantId, tenantId, StringComparison.Ordinal))
            throw new InvalidOperationException("Invalid email, password, or company id.");

        var valid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!valid)
            throw new InvalidOperationException("Invalid email or password.");

        var roles = await userManager.GetRolesAsync(user);
        return tokenService.CreateToken(user, roles, user.TenantId);
    }

    private async Task EnsureRoleExistsAsync(string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
            await roleManager.CreateAsync(new AppRole(roleName));
    }

    private static List<string> ParseAndValidateInvitedRoles(string csv)
    {
        if (string.IsNullOrWhiteSpace(csv))
            return new List<string>();

        var allowed = AppRoleNames.AllRoles.ToHashSet(StringComparer.Ordinal);
        var list = csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(r => !string.IsNullOrEmpty(r))
            .Distinct(StringComparer.Ordinal)
            .Where(r => allowed.Contains(r) && r != AppRoleNames.SuperAdmin)
            .ToList();

        return list;
    }
}

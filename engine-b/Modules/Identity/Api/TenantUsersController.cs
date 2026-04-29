using engine_b.Modules.Identity.Application.Services;
using engine_b.Modules.Identity.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Identity.Api;

[ApiController]
[Route("api/tenants/{tenantId}/users")]
[Authorize(Roles = AppRoleNames.SuperAdmin)]
public class TenantUsersController(UserManager<AppUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> ListUsers([FromRoute] string tenantId)
    {
        var tid = AuthService.NormalizeTenantId(tenantId);
        if (string.IsNullOrEmpty(tid))
            return BadRequest(new { error = "tenantId is required." });

        var caller = await userManager.GetUserAsync(User);
        if (caller is null || !string.Equals(caller.TenantId, tid, StringComparison.Ordinal))
            return Forbid();

        var users = await userManager.Users
            .Where(u => u.TenantId == tid)
            .OrderBy(u => u.CreatedAt)
            .ToListAsync();

        var result = new List<object>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            result.Add(new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                roles,
                createdAt = user.CreatedAt,
            });
        }

        return Ok(result);
    }
}

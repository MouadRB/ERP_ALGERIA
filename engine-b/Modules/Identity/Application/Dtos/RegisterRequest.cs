namespace engine_b.Modules.Identity.Application.Dtos;

/// <param name="TenantId">Company / tenant identifier from the frontend.</param>
/// <param name="InviteToken">Required when joining an existing tenant (from SuperAdmin invite), unless you are the first user for this tenant.</param>
public record RegisterRequest(string Email, string Password, string FullName, string TenantId, string? InviteToken = null);

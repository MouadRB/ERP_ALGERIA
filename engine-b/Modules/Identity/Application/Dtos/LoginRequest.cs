namespace engine_b.Modules.Identity.Application.Dtos;

/// <param name="TenantId">Company / tenant identifier; must match the signed-in user's tenant.</param>
public record LoginRequest(string Email, string Password, string TenantId);

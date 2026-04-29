namespace engine_b.Modules.Identity.Application.Dtos;

public record CreateTenantInviteRequest(string Email, IReadOnlyList<string> Roles);

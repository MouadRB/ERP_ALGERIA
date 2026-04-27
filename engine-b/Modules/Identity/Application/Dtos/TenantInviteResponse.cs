namespace engine_b.Modules.Identity.Application.Dtos;

/// <summary>
/// Returned when the invited person has no account yet; frontend sends <c>inviteToken</c> with register.
/// </summary>
public record TenantInviteResponse(string Email, string TenantId, string InviteToken, DateTime ExpiresAtUtc);

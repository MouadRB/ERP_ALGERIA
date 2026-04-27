using System.ComponentModel.DataAnnotations;

namespace engine_b.Modules.Identity.Domain;

public class TenantInvitation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [MaxLength(100)]
    public string TenantId { get; set; } = string.Empty;

    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Comma-separated list of role names (PascalCase, e.g. "CRMAgent,FinanceManager").
    /// </summary>
    public string RolesCsv { get; set; } = string.Empty;

    [MaxLength(128)]
    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? AcceptedAt { get; set; }
    public Guid? InvitedByUserId { get; set; }
}


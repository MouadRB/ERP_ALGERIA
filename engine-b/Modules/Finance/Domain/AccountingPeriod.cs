namespace engine_b.Modules.Finance.Domain;

/// <summary>Accounting period lifecycle: Open → Locked → Closed.</summary>
public enum PeriodStatus
{
    Open = 0,
    Locked = 1,
    Closed = 2,
}

/// <summary>
/// Monthly accounting period. Once Locked, no new journal entries can be
/// created within the period. Once Closed, the period is finalized.
/// </summary>
public class AccountingPeriod
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Human-readable name, e.g. "Avril 2026".</summary>
    public string Name { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public PeriodStatus Status { get; set; } = PeriodStatus.Open;

    // ── Lock audit ──
    public DateTime? LockedAt { get; set; }
    public string? LockedBy { get; set; }

    // ── Close audit ──
    public DateTime? ClosedAt { get; set; }
    public string? ClosedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ── Navigation ──
    public ICollection<JournalEntry> JournalEntries { get; set; } = [];
}

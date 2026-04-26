namespace engine_b.Modules.Finance.Domain;

/// <summary>Type of journal entry for the general ledger.</summary>
public enum JournalEntryType
{
    Revenue = 0,
    CostOfGoodsSold = 1,
    Refund = 2,
    Adjustment = 3,
    Transfer = 4,
}

/// <summary>
/// Double-entry journal entry for the general ledger.
/// Each entry debits one account and credits another for the same amount.
/// </summary>
public class JournalEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Readable reference, e.g. "JRN-2026-0001".</summary>
    public string EntryNumber { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    /// <summary>Account code being debited, e.g. "411000" (Clients).</summary>
    public string DebitAccount { get; set; } = string.Empty;

    /// <summary>Account code being credited, e.g. "701000" (Ventes).</summary>
    public string CreditAccount { get; set; } = string.Empty;

    /// <summary>Amount in DZD.</summary>
    public decimal Amount { get; set; }

    public JournalEntryType EntryType { get; set; } = JournalEntryType.Revenue;

    // ── Period linkage ──
    public Guid PeriodId { get; set; }
    public AccountingPeriod? Period { get; set; }

    // ── Optional source ──
    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

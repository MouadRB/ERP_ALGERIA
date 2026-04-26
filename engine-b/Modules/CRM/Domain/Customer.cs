namespace engine_b.Modules.CRM.Domain;

public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }

    /// <summary>Wilaya code 1–48 (Algerian provinces).</summary>
    public int Wilaya { get; set; }
    public string City { get; set; } = string.Empty;

    // ── Extended Profile Details ──
    public string? SecondaryPhone { get; set; }
    public string? PreferredChannel { get; set; }
    public string? PreferredLanguage { get; set; }
    public string? DeliveryAddress { get; set; }

    // ── Order aggregates (denormalized for fast reads) ──
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }

    /// <summary>Return rate as a percentage (0–100).</summary>
    public decimal ReturnRate { get; set; }

    // ── Segmentation ──
    public CustomerSegment Segment { get; set; } = CustomerSegment.Nouveau;
    public RiskLevel RiskLevel { get; set; } = RiskLevel.Faible;
    public int RiskScore { get; set; }

    // ── Blacklist ──
    public bool IsBlacklisted { get; set; }
    public string? BlacklistReason { get; set; }
    public string? BlacklistNotes { get; set; }
    public DateTime? BlacklistedAt { get; set; }
    public string? BlacklistedBy { get; set; }

    // ── Timestamps ──
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastOrderDate { get; set; }

    // ── Navigation ──
    public ICollection<SupportTicket> Tickets { get; set; } = [];
    public ICollection<CustomerInteraction> Interactions { get; set; } = [];

    // ── Computed helpers ──
    public bool IsVip => Segment == CustomerSegment.VIP;
}

using engine_b.Modules.CRM.Domain;

namespace engine_b.Modules.CRM.Application.Dtos;

public class CustomerDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int Wilaya { get; set; }
    public string City { get; set; } = string.Empty;
    public string? SecondaryPhone { get; set; }
    public string? PreferredChannel { get; set; }
    public string? PreferredLanguage { get; set; }
    public string? DeliveryAddress { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal ReturnRate { get; set; }
    public string Segment { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public bool IsBlacklisted { get; set; }
    public string? BlacklistReason { get; set; }
    public string? BlacklistNotes { get; set; }
    public DateTime? BlacklistedAt { get; set; }
    public string? BlacklistedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastOrderDate { get; set; }
    public bool IsVip { get; set; }

    public static CustomerDto FromEntity(Customer c) => new()
    {
        Id = c.Id,
        FullName = c.FullName,
        Phone = c.Phone,
        Email = c.Email,
        Wilaya = c.Wilaya,
        City = c.City,
        SecondaryPhone = c.SecondaryPhone,
        PreferredChannel = c.PreferredChannel,
        PreferredLanguage = c.PreferredLanguage,
        DeliveryAddress = c.DeliveryAddress,
        TotalOrders = c.TotalOrders,
        TotalRevenue = c.TotalRevenue,
        ReturnRate = c.ReturnRate,
        Segment = c.Segment.ToString(),
        RiskLevel = c.RiskLevel.ToString(),
        RiskScore = c.RiskScore,
        IsBlacklisted = c.IsBlacklisted,
        BlacklistReason = c.BlacklistReason,
        BlacklistNotes = c.BlacklistNotes,
        BlacklistedAt = c.BlacklistedAt,
        BlacklistedBy = c.BlacklistedBy,
        CreatedAt = c.CreatedAt,
        LastOrderDate = c.LastOrderDate,
        IsVip = c.IsVip,
    };
}

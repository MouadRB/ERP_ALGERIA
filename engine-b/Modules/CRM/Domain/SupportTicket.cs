namespace engine_b.Modules.CRM.Domain;

public class SupportTicket
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public string TicketNumber { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public TicketType Type { get; set; } = TicketType.Other;
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public TicketPriority Priority { get; set; } = TicketPriority.Normal;
    
    public string? RelatedOrderId { get; set; }
    public string? AssignedAgentName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActionAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

public enum TicketStatus
{
    Open,
    InProgress,
    WaitingClient,  // En attente client
    Escalated,
    Resolved,
    Closed,
}

public enum TicketType
{
    DeliveryDispute,
    ProductReturn,
    OrderError,
    Fraud,
    CodAmountIncorrect,
    Other
}

public enum TicketPriority
{
    Critical,
    High,
    Normal,
    Low
}

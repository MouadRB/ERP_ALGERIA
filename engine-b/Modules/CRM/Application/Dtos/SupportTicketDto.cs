using engine_b.Modules.CRM.Domain;

namespace engine_b.Modules.CRM.Application.Dtos;

public class SupportTicketDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string TicketNumber { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string? RelatedOrderId { get; set; }
    public string? AssignedAgentName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastActionAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    public static SupportTicketDto FromEntity(SupportTicket t) => new()
    {
        Id = t.Id,
        CustomerId = t.CustomerId,
        CustomerName = t.Customer?.FullName ?? string.Empty,
        TicketNumber = t.TicketNumber,
        Subject = t.Subject,
        Description = t.Description,
        Type = t.Type.ToString(),
        Status = t.Status.ToString(),
        Priority = t.Priority.ToString(),
        RelatedOrderId = t.RelatedOrderId,
        AssignedAgentName = t.AssignedAgentName,
        CreatedAt = t.CreatedAt,
        LastActionAt = t.LastActionAt,
        ResolvedAt = t.ResolvedAt,
    };
}

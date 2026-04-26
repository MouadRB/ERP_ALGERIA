namespace engine_b.Modules.CRM.Application.Dtos;

public record CreateTicketRequest(
    Guid CustomerId,
    string Subject,
    string? Description,
    string? Type,
    string? Priority,
    string? RelatedOrderId,
    string? AssignedAgentName);

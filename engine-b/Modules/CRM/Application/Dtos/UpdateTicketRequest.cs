namespace engine_b.Modules.CRM.Application.Dtos;

public record UpdateTicketRequest(
    string? Subject,
    string? Status,
    string? Type,
    string? Priority,
    string? RelatedOrderId,
    string? AssignedAgentName);

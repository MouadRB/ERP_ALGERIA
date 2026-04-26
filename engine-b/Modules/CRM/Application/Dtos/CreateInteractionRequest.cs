namespace engine_b.Modules.CRM.Application.Dtos;

public record CreateInteractionRequest(
    Guid CustomerId,
    string Content,
    string? Type = null,
    string? CreatedBy = null);

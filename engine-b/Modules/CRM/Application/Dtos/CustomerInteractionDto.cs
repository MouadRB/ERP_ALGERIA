using engine_b.Modules.CRM.Domain;

namespace engine_b.Modules.CRM.Application.Dtos;

public class CustomerInteractionDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public static CustomerInteractionDto FromEntity(CustomerInteraction i) => new()
    {
        Id = i.Id,
        CustomerId = i.CustomerId,
        Content = i.Content,
        Type = i.Type.ToString(),
        CreatedBy = i.CreatedBy,
        CreatedAt = i.CreatedAt,
    };
}

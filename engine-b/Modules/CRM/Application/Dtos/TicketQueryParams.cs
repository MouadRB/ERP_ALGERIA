using engine_b.Modules.CRM.Domain;

namespace engine_b.Modules.CRM.Application.Dtos;

public class TicketQueryParams
{
    public Guid? CustomerId { get; set; }
    public TicketStatus? Status { get; set; }
    public TicketPriority? Priority { get; set; }
    public TicketType? Type { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "CreatedAt";
    public bool SortDesc { get; set; } = true;
}

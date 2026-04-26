using engine_b.Modules.CRM.Domain;

namespace engine_b.Modules.CRM.Application.Dtos;

public class CustomerQueryParams
{
    public string? Search { get; set; }
    public CustomerSegment? Segment { get; set; }
    public RiskLevel? Risk { get; set; }
    public int? Wilaya { get; set; }
    public bool? IsBlacklisted { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "LastOrderDate";
    public bool SortDesc { get; set; } = true;
}

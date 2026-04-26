namespace engine_b.Modules.CRM.Application.Dtos;

public class CrmFilterMetadataDto
{
    public List<FilterOptionDto> Segments { get; set; } = [];
    public List<FilterOptionDto> RiskLevels { get; set; } = [];
    public List<FilterOptionDto> TicketTypes { get; set; } = [];
    public List<WilayaFilterOptionDto> Wilayas { get; set; } = [];
    public FilterTotalsDto Totals { get; set; } = new();
}

public class FilterOptionDto
{
    public string Key { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class WilayaFilterOptionDto
{
    public int Key { get; set; }
    public string Label { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class FilterTotalsDto
{
    public int Customers { get; set; }
    public int BlacklistedCustomers { get; set; }
    public int OpenTickets { get; set; }
}

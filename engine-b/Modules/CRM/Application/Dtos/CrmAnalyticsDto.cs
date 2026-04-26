namespace engine_b.Modules.CRM.Application.Dtos;

public class CrmAnalyticsDto
{
    public List<SegmentBreakdownItemDto> SegmentBreakdown { get; set; } = [];
    public List<WilayaReturnRateItemDto> ReturnRateByWilaya { get; set; } = [];
    public List<WeeklyReturnTrendItemDto> WeeklyReturnTrend { get; set; } = [];
    public List<TopClientRevenueItemDto> TopClientsByRevenue { get; set; } = [];
    public List<TicketReasonItemDto> TopTicketReasons { get; set; } = [];
}

public class SegmentBreakdownItemDto
{
    public string Segment { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class WilayaReturnRateItemDto
{
    public int Wilaya { get; set; }
    public decimal ReturnRate { get; set; }
    public int CustomerCount { get; set; }
}

public class WeeklyReturnTrendItemDto
{
    public string WeekLabel { get; set; } = string.Empty;
    public int ReturnedOrders { get; set; }
    public int TotalOrders { get; set; }
    public decimal ReturnRate { get; set; }
}

public class TopClientRevenueItemDto
{
    public Guid CustomerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Wilaya { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
}

public class TicketReasonItemDto
{
    public string Reason { get; set; } = string.Empty;
    public int Count { get; set; }
}

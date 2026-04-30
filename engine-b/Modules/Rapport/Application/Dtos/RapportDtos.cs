using engine_b.Modules.CRM.Application.Dtos;
using engine_b.Modules.Dashboard.Application.Dtos;
using engine_b.Modules.Finance.Application.Dtos;
using engine_b.Modules.Procurement.Application.Dtos;

namespace engine_b.Modules.Rapport.Application.Dtos;

public class RapportOverviewQueryParams
{
    // Supported: today, 7d, 30d, quarter, year, custom
    public string Period { get; set; } = "30d";
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int TopProducts { get; set; } = 5;
}

public class RapportDateRange
{
    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }
    public DateTime CompareStartUtc { get; set; }
    public DateTime CompareEndUtc { get; set; }
    public int PeriodDays { get; set; }
    public string Preset { get; set; } = "30d";
}

public class RapportOverviewDto
{
    public RapportDateRange DateRange { get; set; } = new();
    public List<RapportWidgetWarningDto> Warnings { get; set; } = [];

    public RapportHeadlineKpisDto HeadlineKpis { get; set; } = new();
    public RevenueOverviewDto RevenueOverview { get; set; } = new();
    public InvoiceStatsDto InvoiceStats { get; set; } = new();
    public DeferredRevenueSummaryDto DeferredRevenue { get; set; } = new();
    public FifoValuationDto FifoValuation { get; set; } = new();
    public ProcurementOverviewDto ProcurementOverview { get; set; } = new();
    public ProcurementAnalyticsDto ProcurementAnalytics { get; set; } = new();
    public CustomerStatsDto CrmStats { get; set; } = new();
    public CrmAnalyticsDto CrmAnalytics { get; set; } = new();
    public DashboardSummaryDto DashboardSummary { get; set; } = new();
    public List<TopProductRevenueDto> TopProducts { get; set; } = [];
    public List<RevenueByWilayaDto> TopWilayasByRevenue { get; set; } = [];
}

public class RapportHeadlineKpisDto
{
    public decimal ChiffreAffaires { get; set; }
    public decimal ChiffreAffairesChangePercent { get; set; }
    public int CommandesRecues { get; set; }
    public int CommandesLivrees { get; set; }
    public decimal TauxLivraisonPercent { get; set; }
    public decimal ValorisationFifo { get; set; }
}

public class RapportWidgetWarningDto
{
    public string Widget { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

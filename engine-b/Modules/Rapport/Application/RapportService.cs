using engine_b.Modules.CRM.Application;
using engine_b.Modules.CRM.Application.Dtos;
using engine_b.Modules.Dashboard.Application;
using engine_b.Modules.Dashboard.Application.Dtos;
using engine_b.Modules.Finance.Application;
using engine_b.Modules.Finance.Application.Dtos;
using engine_b.Modules.Procurement.Application;
using engine_b.Modules.Procurement.Application.Dtos;
using engine_b.Modules.Rapport.Application.Dtos;

namespace engine_b.Modules.Rapport.Application;

public class RapportService(
    RevenueRecognitionService revenueService,
    InvoiceService invoiceService,
    DeferredRevenueService deferredRevenueService,
    ProcurementService procurementService,
    CustomerService customerService,
    DashboardService dashboardService)
{
    public async Task<RapportOverviewDto> GetOverviewAsync(RapportOverviewQueryParams query)
    {
        var range = ResolveDateRange(query);
        var warnings = new List<RapportWidgetWarningDto>();

        var revenueOverview = await SafeExecuteAsync(
            "revenue_overview",
            () => revenueService.GetRevenueOverviewAsync(range.PeriodDays),
            new RevenueOverviewDto(),
            warnings);

        var invoiceStats = await SafeExecuteAsync(
            "invoice_stats",
            invoiceService.GetInvoiceStatsAsync,
            new InvoiceStatsDto(),
            warnings);

        var deferredRevenue = await SafeExecuteAsync(
            "deferred_revenue",
            deferredRevenueService.GetDeferredRevenueSummaryAsync,
            new DeferredRevenueSummaryDto(),
            warnings);

        var fifoValuation = await SafeExecuteAsync(
            "fifo_valuation",
            deferredRevenueService.GetFifoValuationAsync,
            new FifoValuationDto(),
            warnings);

        var procurementOverview = await SafeExecuteAsync(
            "procurement_overview",
            procurementService.GetOverviewAsync,
            new ProcurementOverviewDto(),
            warnings);

        var procurementAnalytics = await SafeExecuteAsync(
            "procurement_analytics",
            procurementService.GetAnalyticsAsync,
            new ProcurementAnalyticsDto(),
            warnings);

        var crmStats = await SafeExecuteAsync(
            "crm_stats",
            customerService.GetStatsAsync,
            new CustomerStatsDto(),
            warnings);

        var crmAnalytics = await SafeExecuteAsync(
            "crm_analytics",
            customerService.GetAnalyticsAsync,
            new CrmAnalyticsDto(),
            warnings);

        var dashboardSummary = await SafeExecuteAsync(
            "dashboard_summary",
            dashboardService.GetSummaryAsync,
            new DashboardSummaryDto(),
            warnings);

        var topProducts = await SafeExecuteAsync(
            "top_products",
            () => revenueService.GetTopProductsByRevenueAsync(query.TopProducts, range.PeriodDays),
            [],
            warnings);

        var topWilayas = await SafeExecuteAsync(
            "top_wilayas",
            () => revenueService.GetRevenueByWilayaAsync(range.PeriodDays),
            [],
            warnings);

        var headline = new RapportHeadlineKpisDto
        {
            ChiffreAffaires = revenueOverview.TotalRevenue,
            ChiffreAffairesChangePercent = revenueOverview.ChangePercent,
            CommandesRecues = dashboardSummary.Kpis.OrdersToday,
            CommandesLivrees = dashboardSummary.CodFunnel.Livrees.Count,
            TauxLivraisonPercent = dashboardSummary.Kpis.DeliveryRatePct,
            ValorisationFifo = fifoValuation.TotalValuation,
        };

        return new RapportOverviewDto
        {
            DateRange = range,
            Warnings = warnings,
            HeadlineKpis = headline,
            RevenueOverview = revenueOverview,
            InvoiceStats = invoiceStats,
            DeferredRevenue = deferredRevenue,
            FifoValuation = fifoValuation,
            ProcurementOverview = procurementOverview,
            ProcurementAnalytics = procurementAnalytics,
            CrmStats = crmStats,
            CrmAnalytics = crmAnalytics,
            DashboardSummary = dashboardSummary,
            TopProducts = topProducts,
            TopWilayasByRevenue = topWilayas.Take(10).ToList(),
        };
    }

    public static RapportDateRange ResolveDateRange(RapportOverviewQueryParams query)
    {
        var now = DateTime.UtcNow;
        var preset = (query.Period ?? "30d").Trim().ToLowerInvariant();

        if (query.TopProducts <= 0 || query.TopProducts > 50)
            throw new ArgumentException("topProducts must be between 1 and 50.");

        DateTime start;
        DateTime end;

        switch (preset)
        {
            case "today":
                start = now.Date;
                end = now;
                break;
            case "7d":
                start = now.AddDays(-7);
                end = now;
                break;
            case "30d":
                start = now.AddDays(-30);
                end = now;
                break;
            case "quarter":
                start = now.AddDays(-90);
                end = now;
                break;
            case "year":
                start = now.AddDays(-365);
                end = now;
                break;
            case "custom":
                if (!query.From.HasValue || !query.To.HasValue)
                    throw new ArgumentException("from and to are required when period=custom.");
                start = DateTime.SpecifyKind(query.From.Value, DateTimeKind.Utc);
                end = DateTime.SpecifyKind(query.To.Value, DateTimeKind.Utc);
                break;
            default:
                throw new ArgumentException("period must be one of: today, 7d, 30d, quarter, year, custom.");
        }

        if (end <= start)
            throw new ArgumentException("to must be greater than from.");

        var periodDays = Math.Max(1, (int)Math.Ceiling((end - start).TotalDays));
        var compareStart = start.AddDays(-periodDays);
        var compareEnd = start;

        return new RapportDateRange
        {
            StartUtc = start,
            EndUtc = end,
            CompareStartUtc = compareStart,
            CompareEndUtc = compareEnd,
            PeriodDays = periodDays,
            Preset = preset,
        };
    }

    public static async Task<T> SafeExecuteAsync<T>(
        string widgetName,
        Func<Task<T>> action,
        T fallback,
        List<RapportWidgetWarningDto> warnings)
    {
        try
        {
            return await action();
        }
        catch (Exception ex)
        {
            warnings.Add(new RapportWidgetWarningDto
            {
                Widget = widgetName,
                Message = ex.Message,
            });
            return fallback;
        }
    }
}

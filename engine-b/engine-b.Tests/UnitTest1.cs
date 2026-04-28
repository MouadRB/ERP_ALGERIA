using engine_b.Modules.Rapport.Application;
using engine_b.Modules.Rapport.Application.Dtos;
using engine_b.Modules.Rapport.Infrastructure;

namespace engine_b.Tests;

public class RapportServiceTests
{
    [Fact]
    public void ResolveDateRange_CustomPeriod_ReturnsExpectedPeriodDays()
    {
        var query = new RapportOverviewQueryParams
        {
            Period = "custom",
            From = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            To = new DateTime(2026, 1, 31, 0, 0, 0, DateTimeKind.Utc),
            TopProducts = 5,
        };

        var range = RapportService.ResolveDateRange(query);

        Assert.Equal("custom", range.Preset);
        Assert.Equal(30, range.PeriodDays);
        Assert.Equal(query.From, range.StartUtc);
        Assert.Equal(query.To, range.EndUtc);
        Assert.Equal(range.StartUtc.AddDays(-30), range.CompareStartUtc);
        Assert.Equal(range.StartUtc, range.CompareEndUtc);
    }

    [Fact]
    public void ResolveDateRange_InvalidTopProducts_ThrowsArgumentException()
    {
        var query = new RapportOverviewQueryParams
        {
            Period = "30d",
            TopProducts = 0,
        };

        var ex = Assert.Throws<ArgumentException>(() => RapportService.ResolveDateRange(query));
        Assert.Contains("topProducts", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SafeExecuteAsync_WhenActionFails_ReturnsFallbackAndWarning()
    {
        var warnings = new List<RapportWidgetWarningDto>();
        var fallback = new RapportDateRange { Preset = "fallback" };

        var result = await RapportService.SafeExecuteAsync(
            "dashboard_summary",
            () => throw new InvalidOperationException("downstream timeout"),
            fallback,
            warnings);

        Assert.Same(fallback, result);
        Assert.Single(warnings);
        Assert.Equal("dashboard_summary", warnings[0].Widget);
        Assert.Contains("downstream timeout", warnings[0].Message, StringComparison.OrdinalIgnoreCase);
    }
}

public class RapportCsvExporterTests
{
    [Fact]
    public void ExportOverview_ProducesCsvWithExpectedSections()
    {
        var exporter = new RapportCsvExporter();
        var overview = new RapportOverviewDto
        {
            DateRange = new RapportDateRange
            {
                Preset = "30d",
                StartUtc = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                EndUtc = new DateTime(2026, 3, 2, 0, 0, 0, DateTimeKind.Utc),
                CompareStartUtc = new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc),
                CompareEndUtc = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                PeriodDays = 30,
            },
            HeadlineKpis = new RapportHeadlineKpisDto
            {
                ChiffreAffaires = 12478200m,
                ChiffreAffairesChangePercent = 18.4m,
                CommandesRecues = 1247,
                CommandesLivrees = 449,
                TauxLivraisonPercent = 36m,
                ValorisationFifo = 48420000m,
            },
            TopProducts =
            [
                new() { ProductName = "Nike Air Max 90", Revenue = 1000000m },
            ],
            TopWilayasByRevenue =
            [
                new() { WilayaName = "Alger", Revenue = 3000000m },
            ],
            Warnings =
            [
                new() { Widget = "crm_analytics", Message = "source unavailable" },
            ]
        };

        var csvBytes = exporter.ExportOverview(overview);
        var csv = System.Text.Encoding.UTF8.GetString(csvBytes);

        Assert.Contains("section,key,value", csv, StringComparison.Ordinal);
        Assert.Contains("headline,chiffre_affaires,12478200", csv, StringComparison.Ordinal);
        Assert.Contains("warnings,crm_analytics,source unavailable", csv, StringComparison.Ordinal);
        Assert.Contains("top_products,Nike Air Max 90,1000000", csv, StringComparison.Ordinal);
        Assert.Contains("top_wilayas_by_revenue,Alger,3000000", csv, StringComparison.Ordinal);
    }
}

using System.Globalization;
using System.Text;
using engine_b.Modules.Rapport.Application.Dtos;

namespace engine_b.Modules.Rapport.Infrastructure;

public class RapportCsvExporter
{
    public byte[] ExportOverview(RapportOverviewDto overview)
    {
        var sb = new StringBuilder();

        sb.AppendLine("section,key,value");
        AppendRow(sb, "period", "preset", overview.DateRange.Preset);
        AppendRow(sb, "period", "start_utc", overview.DateRange.StartUtc.ToString("O"));
        AppendRow(sb, "period", "end_utc", overview.DateRange.EndUtc.ToString("O"));
        AppendRow(sb, "period", "compare_start_utc", overview.DateRange.CompareStartUtc.ToString("O"));
        AppendRow(sb, "period", "compare_end_utc", overview.DateRange.CompareEndUtc.ToString("O"));
        AppendRow(sb, "period", "period_days", overview.DateRange.PeriodDays.ToString(CultureInfo.InvariantCulture));

        AppendRow(sb, "headline", "chiffre_affaires", FormatDecimal(overview.HeadlineKpis.ChiffreAffaires));
        AppendRow(sb, "headline", "chiffre_affaires_change_percent", FormatDecimal(overview.HeadlineKpis.ChiffreAffairesChangePercent));
        AppendRow(sb, "headline", "commandes_recues", overview.HeadlineKpis.CommandesRecues.ToString(CultureInfo.InvariantCulture));
        AppendRow(sb, "headline", "commandes_livrees", overview.HeadlineKpis.CommandesLivrees.ToString(CultureInfo.InvariantCulture));
        AppendRow(sb, "headline", "taux_livraison_percent", FormatDecimal(overview.HeadlineKpis.TauxLivraisonPercent));
        AppendRow(sb, "headline", "valorisation_fifo", FormatDecimal(overview.HeadlineKpis.ValorisationFifo));

        AppendRow(sb, "revenue_overview", "total_revenue", FormatDecimal(overview.RevenueOverview.TotalRevenue));
        AppendRow(sb, "revenue_overview", "previous_period_revenue", FormatDecimal(overview.RevenueOverview.PreviousPeriodRevenue));
        AppendRow(sb, "revenue_overview", "change_percent", FormatDecimal(overview.RevenueOverview.ChangePercent));
        AppendRow(sb, "revenue_overview", "invoice_count", overview.RevenueOverview.InvoiceCount.ToString(CultureInfo.InvariantCulture));
        AppendRow(sb, "revenue_overview", "paid_invoice_count", overview.RevenueOverview.PaidInvoiceCount.ToString(CultureInfo.InvariantCulture));
        AppendRow(sb, "revenue_overview", "average_invoice_value", FormatDecimal(overview.RevenueOverview.AverageInvoiceValue));

        foreach (var warning in overview.Warnings)
            AppendRow(sb, "warnings", warning.Widget, warning.Message);

        foreach (var product in overview.TopProducts)
            AppendRow(sb, "top_products", product.ProductName, FormatDecimal(product.Revenue));

        foreach (var wilaya in overview.TopWilayasByRevenue)
            AppendRow(sb, "top_wilayas_by_revenue", wilaya.WilayaName, FormatDecimal(wilaya.Revenue));

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static void AppendRow(StringBuilder sb, string section, string key, string value)
        => sb.AppendLine($"{Escape(section)},{Escape(key)},{Escape(value)}");

    private static string Escape(string raw)
    {
        if (raw.Contains(',') || raw.Contains('"') || raw.Contains('\n') || raw.Contains('\r'))
            return $"\"{raw.Replace("\"", "\"\"", StringComparison.Ordinal)}\"";

        return raw;
    }

    private static string FormatDecimal(decimal value)
        => value.ToString("0.##", CultureInfo.InvariantCulture);
}

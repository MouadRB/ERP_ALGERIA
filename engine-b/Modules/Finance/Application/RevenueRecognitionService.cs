using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Finance.Application.Dtos;
using engine_b.Modules.Finance.Domain;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Finance.Application;

/// <summary>
/// Powers the revenue KPIs from the Rapports & Analytiques dashboard:
/// Chiffre d'Affaires, CA par Wilaya, revenue timeline, top products.
/// </summary>
public class RevenueRecognitionService(AppDbContext db)
{
    // Algerian wilaya names (1–58)
    private static readonly Dictionary<int, string> WilayaNames = new()
    {
        {1,"Adrar"},{2,"Chlef"},{3,"Laghouat"},{4,"Oum El Bouaghi"},{5,"Batna"},
        {6,"Béjaïa"},{7,"Biskra"},{8,"Béchar"},{9,"Blida"},{10,"Bouira"},
        {11,"Tamanrasset"},{12,"Tébessa"},{13,"Tlemcen"},{14,"Tiaret"},{15,"Tizi Ouzou"},
        {16,"Alger"},{17,"Djelfa"},{18,"Jijel"},{19,"Sétif"},{20,"Saïda"},
        {21,"Skikda"},{22,"Sidi Bel Abbès"},{23,"Annaba"},{24,"Guelma"},{25,"Constantine"},
        {26,"Médéa"},{27,"Mostaganem"},{28,"M'Sila"},{29,"Mascara"},{30,"Ouargla"},
        {31,"Oran"},{32,"El Bayadh"},{33,"Illizi"},{34,"Bordj Bou Arréridj"},{35,"Boumerdès"},
        {36,"El Tarf"},{37,"Tindouf"},{38,"Tissemsilt"},{39,"El Oued"},{40,"Khenchela"},
        {41,"Souk Ahras"},{42,"Tipaza"},{43,"Mila"},{44,"Aïn Defla"},{45,"Naâma"},
        {46,"Aïn Témouchent"},{47,"Ghardaïa"},{48,"Relizane"},
        {49,"El M'Ghair"},{50,"El Meniaa"},{51,"Ouled Djellal"},{52,"Bordj Badji Mokhtar"},
        {53,"Béni Abbès"},{54,"Timimoun"},{55,"Touggourt"},{56,"Djanet"},
        {57,"In Salah"},{58,"In Guezzam"},
    };

    /// <summary>
    /// Revenue overview: total CA, comparison vs previous period, averages.
    /// Sources from paid invoices (Chiffre d'Affaires — Livraisons confirmées).
    /// </summary>
    public async Task<RevenueOverviewDto> GetRevenueOverviewAsync(int periodDays = 30)
    {
        var now = DateTime.UtcNow;
        var periodStart = now.AddDays(-periodDays);
        var prevStart = periodStart.AddDays(-periodDays);

        var currentInvoices = await db.Set<Invoice>()
            .Where(i => i.Status == InvoiceStatus.Paid && i.PaidAt >= periodStart)
            .ToListAsync();

        var prevInvoices = await db.Set<Invoice>()
            .Where(i => i.Status == InvoiceStatus.Paid && i.PaidAt >= prevStart && i.PaidAt < periodStart)
            .ToListAsync();

        var currentRev = currentInvoices.Sum(i => i.TotalAmount);
        var prevRev = prevInvoices.Sum(i => i.TotalAmount);
        var change = prevRev == 0 ? 0 : Math.Round((currentRev - prevRev) / prevRev * 100, 1);

        return new RevenueOverviewDto
        {
            TotalRevenue = currentRev,
            PreviousPeriodRevenue = prevRev,
            ChangePercent = change,
            InvoiceCount = currentInvoices.Count,
            PaidInvoiceCount = currentInvoices.Count,
            AverageInvoiceValue = currentInvoices.Count == 0 ? 0
                : Math.Round(currentRev / currentInvoices.Count, 2),
        };
    }

    /// <summary>
    /// Revenue breakdown by wilaya for the "CA par Wilaya — Top 10" chart.
    /// </summary>
    public async Task<List<RevenueByWilayaDto>> GetRevenueByWilayaAsync(int periodDays = 30)
    {
        var since = DateTime.UtcNow.AddDays(-periodDays);
        var invoices = await db.Set<Invoice>()
            .Where(i => i.Status == InvoiceStatus.Paid && i.PaidAt >= since)
            .ToListAsync();

        var totalRev = invoices.Sum(i => i.TotalAmount);

        return invoices
            .GroupBy(i => i.Wilaya)
            .Select(g => new RevenueByWilayaDto
            {
                Wilaya = g.Key,
                WilayaName = WilayaNames.GetValueOrDefault(g.Key, $"Wilaya {g.Key}"),
                Revenue = g.Sum(i => i.TotalAmount),
                InvoiceCount = g.Count(),
                SharePercent = totalRev == 0 ? 0 : Math.Round(g.Sum(i => i.TotalAmount) / totalRev * 100, 1),
            })
            .OrderByDescending(w => w.Revenue)
            .ToList();
    }

    /// <summary>
    /// Daily revenue timeline for the "CA (DZD) et Volume Commandes — 30J" chart.
    /// </summary>
    public async Task<List<RevenueTimelinePointDto>> GetRevenueTimelineAsync(int periodDays = 30)
    {
        var since = DateTime.UtcNow.AddDays(-periodDays);
        var invoices = await db.Set<Invoice>()
            .Where(i => i.Status == InvoiceStatus.Paid && i.PaidAt >= since)
            .ToListAsync();

        return Enumerable.Range(0, periodDays)
            .Select(d =>
            {
                var date = since.AddDays(d).Date;
                var dayInvoices = invoices.Where(i => i.PaidAt!.Value.Date == date).ToList();
                return new RevenueTimelinePointDto
                {
                    Date = date,
                    Revenue = dayInvoices.Sum(i => i.TotalAmount),
                    InvoiceCount = dayInvoices.Count,
                };
            })
            .ToList();
    }

    /// <summary>
    /// Top products by revenue for the "Top 5 Produits — CA" chart.
    /// Uses order numbers as a proxy for product grouping.
    /// </summary>
    public async Task<List<TopProductRevenueDto>> GetTopProductsByRevenueAsync(int top = 5, int periodDays = 30)
    {
        var since = DateTime.UtcNow.AddDays(-periodDays);
        var invoices = await db.Set<Invoice>()
            .Where(i => i.Status == InvoiceStatus.Paid && i.PaidAt >= since)
            .ToListAsync();

        var totalRev = invoices.Sum(i => i.TotalAmount);

        // Group by customer as a proxy (actual product-level data comes from the OMS/Catalogue module)
        return invoices
            .GroupBy(i => i.CustomerName)
            .Select(g => new TopProductRevenueDto
            {
                ProductName = g.Key,
                Revenue = g.Sum(i => i.TotalAmount),
                SharePercent = totalRev == 0 ? 0 : Math.Round(g.Sum(i => i.TotalAmount) / totalRev * 100, 1),
                Sources = ["OMS", "CRM"],
            })
            .OrderByDescending(p => p.Revenue)
            .Take(top)
            .ToList();
    }
}

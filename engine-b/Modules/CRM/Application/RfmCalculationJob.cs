using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.CRM.Domain;
using engine_b.Modules.CRM.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.CRM.Application;

/// <summary>
/// Recalculates the RFM segment for all customers.
/// VIP:      ≥10 orders AND ≥100,000 DZD revenue
/// Fidèle:   ≥5 orders
/// Nouveau:   ≤2 orders AND created within 30 days
/// À risque: return rate ≥ 20%
/// Inactif:  no order in 90+ days
/// </summary>
public class RfmCalculationJob(CustomerRepository repo, AppDbContext db)
{
    public async Task<int> RunAsync()
    {
        var customers = await repo.QueryAll().ToListAsync();
        var now = DateTime.UtcNow;
        var updated = 0;

        foreach (var c in customers)
        {
            var previous = c.Segment;

            c.Segment = c switch
            {
                { ReturnRate: >= 20 }                                           => CustomerSegment.ARisque,
                { TotalOrders: >= 10 } when c.TotalRevenue >= 100_000          => CustomerSegment.VIP,
                { TotalOrders: >= 5 }                                           => CustomerSegment.Fidele,
                _ when c.LastOrderDate.HasValue
                       && (now - c.LastOrderDate.Value).TotalDays > 90         => CustomerSegment.Inactif,
                _ when !c.LastOrderDate.HasValue
                       && (now - c.CreatedAt).TotalDays > 90                   => CustomerSegment.Inactif,
                { TotalOrders: <= 2 } when (now - c.CreatedAt).TotalDays <= 30 => CustomerSegment.Nouveau,
                _                                                               => c.Segment,
            };

            if (c.Segment != previous) updated++;
        }

        await db.SaveChangesAsync();
        return updated;
    }
}

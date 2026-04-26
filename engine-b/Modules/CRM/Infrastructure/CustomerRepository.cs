using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.CRM.Application.Dtos;
using engine_b.Modules.CRM.Domain;
using engine_b.Modules.Dashboard.Domain;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.CRM.Infrastructure;

public class CustomerRepository(AppDbContext db)
{
    private static readonly IReadOnlyDictionary<int, string> WilayaNames = new Dictionary<int, string>
    {
        [1] = "Adrar",
        [2] = "Chlef",
        [3] = "Laghouat",
        [4] = "Oum El Bouaghi",
        [5] = "Batna",
        [6] = "Bejaia",
        [7] = "Biskra",
        [8] = "Bechar",
        [9] = "Blida",
        [10] = "Bouira",
        [11] = "Tamanrasset",
        [12] = "Tebessa",
        [13] = "Tlemcen",
        [14] = "Tiaret",
        [15] = "Tizi Ouzou",
        [16] = "Alger",
        [17] = "Djelfa",
        [18] = "Jijel",
        [19] = "Setif",
        [20] = "Saida",
        [21] = "Skikda",
        [22] = "Sidi Bel Abbes",
        [23] = "Annaba",
        [24] = "Guelma",
        [25] = "Constantine",
        [26] = "Medea",
        [27] = "Mostaganem",
        [28] = "M'Sila",
        [29] = "Mascara",
        [30] = "Ouargla",
        [31] = "Oran",
        [32] = "El Bayadh",
        [33] = "Illizi",
        [34] = "Bordj Bou Arreridj",
        [35] = "Boumerdes",
        [36] = "El Tarf",
        [37] = "Tindouf",
        [38] = "Tissemsilt",
        [39] = "El Oued",
        [40] = "Khenchela",
        [41] = "Souk Ahras",
        [42] = "Tipaza",
        [43] = "Mila",
        [44] = "Ain Defla",
        [45] = "Naama",
        [46] = "Ain Temouchent",
        [47] = "Ghardaia",
        [48] = "Relizane",
        [49] = "Timimoun",
        [50] = "Bordj Badji Mokhtar",
        [51] = "Ouled Djellal",
        [52] = "Beni Abbes",
        [53] = "In Salah",
        [54] = "In Guezzam",
        [55] = "Touggourt",
        [56] = "Djanet",
        [57] = "El M'Ghair",
        [58] = "El Meniaa"
    };

    // ── Paged + Filtered list ────────────────────────────────────────────────
    public async Task<PagedResult<Customer>> GetPagedAsync(CustomerQueryParams q)
    {
        IQueryable<Customer> query = db.Customers.AsNoTracking();

        // Text search: phone or name
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var term = q.Search.Trim().ToLower();
            query = query.Where(c =>
                c.Phone.ToLower().Contains(term) ||
                c.FullName.ToLower().Contains(term));
        }

        // Filters
        if (q.Segment.HasValue) query = query.Where(c => c.Segment == q.Segment.Value);
        if (q.Risk.HasValue)    query = query.Where(c => c.RiskLevel == q.Risk.Value);
        if (q.Wilaya.HasValue)  query = query.Where(c => c.Wilaya == q.Wilaya.Value);
        if (q.IsBlacklisted.HasValue) query = query.Where(c => c.IsBlacklisted == q.IsBlacklisted.Value);

        var total = await query.CountAsync();

        // Sorting
        query = q.SortBy?.ToLower() switch
        {
            "fullname"     => q.SortDesc ? query.OrderByDescending(c => c.FullName)     : query.OrderBy(c => c.FullName),
            "totalrevenue" => q.SortDesc ? query.OrderByDescending(c => c.TotalRevenue)  : query.OrderBy(c => c.TotalRevenue),
            "totalorders"  => q.SortDesc ? query.OrderByDescending(c => c.TotalOrders)   : query.OrderBy(c => c.TotalOrders),
            "returnrate"   => q.SortDesc ? query.OrderByDescending(c => c.ReturnRate)    : query.OrderBy(c => c.ReturnRate),
            "risque"       => q.SortDesc ? query.OrderByDescending(c => c.RiskScore)     : query.OrderBy(c => c.RiskScore),
            "createdat"    => q.SortDesc ? query.OrderByDescending(c => c.CreatedAt)     : query.OrderBy(c => c.CreatedAt),
            _              => q.SortDesc ? query.OrderByDescending(c => c.LastOrderDate) : query.OrderBy(c => c.LastOrderDate),
        };

        var items = await query
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .ToListAsync();

        return new PagedResult<Customer>
        {
            Items = items,
            TotalCount = total,
            Page = q.Page,
            PageSize = q.PageSize,
        };
    }

    // ── Stats for KPI cards ──────────────────────────────────────────────────
    public async Task<CustomerStatsDto> GetStatsAsync()
    {
        var customers = db.Customers.AsNoTracking();
        return new CustomerStatsDto
        {
            TotalCustomers        = await customers.CountAsync(),
            VipCount              = await customers.CountAsync(c => c.Segment == CustomerSegment.VIP),
            VipRevenue            = await customers.Where(c => c.Segment == CustomerSegment.VIP).SumAsync(c => c.TotalRevenue),
            TotalOrdersAllClients = await customers.SumAsync(c => c.TotalOrders),
            NouveauCount          = await customers.CountAsync(c => c.Segment == CustomerSegment.Nouveau),
            InactifCount          = await customers.CountAsync(c => c.Segment == CustomerSegment.Inactif),
            AtRiskCount           = await customers.CountAsync(c => c.Segment == CustomerSegment.ARisque),
            BlacklistedCount      = await customers.CountAsync(c => c.IsBlacklisted),
            OpenTicketCount       = await db.SupportTickets.CountAsync(t => t.Status != TicketStatus.Closed),
            ActiveCustomers       = await customers.CountAsync(c =>
                c.Segment != CustomerSegment.Inactif && !c.IsBlacklisted),
        };
    }

    // ── Analytics payload (Segments & Analytics tab) ─────────────────────────
    public async Task<CrmAnalyticsDto> GetAnalyticsAsync()
    {
        var segmentBreakdown = await db.Customers.AsNoTracking()
            .GroupBy(c => c.Segment)
            .Select(g => new SegmentBreakdownItemDto
            {
                Segment = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ToListAsync();

        var returnRateByWilaya = await db.Customers.AsNoTracking()
            .GroupBy(c => c.Wilaya)
            .Select(g => new WilayaReturnRateItemDto
            {
                Wilaya = g.Key,
                ReturnRate = Math.Round(g.Average(x => x.ReturnRate), 2),
                CustomerCount = g.Count()
            })
            .OrderByDescending(x => x.ReturnRate)
            .Take(10)
            .ToListAsync();

        var topClientsByRevenue = await db.Customers.AsNoTracking()
            .OrderByDescending(c => c.TotalRevenue)
            .Take(10)
            .Select(c => new TopClientRevenueItemDto
            {
                CustomerId = c.Id,
                FullName = c.FullName,
                Wilaya = c.Wilaya.ToString(),
                Revenue = c.TotalRevenue,
                Orders = c.TotalOrders
            })
            .ToListAsync();

        var topTicketReasons = await db.SupportTickets.AsNoTracking()
            .GroupBy(t => t.Type)
            .Select(g => new TicketReasonItemDto
            {
                Reason = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var weeklyReturnTrend = new List<WeeklyReturnTrendItemDto>();
        for (var i = 3; i >= 0; i--)
        {
            var start = now.Date.AddDays(-7 * (i + 1));
            var end = now.Date.AddDays(-7 * i);

            var total = await db.Orders.AsNoTracking()
                .CountAsync(o => o.CreatedAt >= start && o.CreatedAt < end);
            var returns = await db.Orders.AsNoTracking()
                .CountAsync(o => o.CreatedAt >= start && o.CreatedAt < end && o.Status == OrderStatus.Retournee);

            weeklyReturnTrend.Add(new WeeklyReturnTrendItemDto
            {
                WeekLabel = $"{start:dd/MM} - {end.AddDays(-1):dd/MM}",
                ReturnedOrders = returns,
                TotalOrders = total,
                ReturnRate = total > 0 ? Math.Round((decimal)returns * 100 / total, 2) : 0
            });
        }

        return new CrmAnalyticsDto
        {
            SegmentBreakdown = segmentBreakdown,
            ReturnRateByWilaya = returnRateByWilaya,
            WeeklyReturnTrend = weeklyReturnTrend,
            TopClientsByRevenue = topClientsByRevenue,
            TopTicketReasons = topTicketReasons
        };
    }

    // ── Filter metadata payload (dropdowns + counters) ───────────────────────
    public async Task<CrmFilterMetadataDto> GetFilterMetadataAsync()
    {
        var segments = await db.Customers.AsNoTracking()
            .GroupBy(c => c.Segment)
            .Select(g => new FilterOptionDto
            {
                Key = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ToListAsync();

        var riskLevels = await db.Customers.AsNoTracking()
            .GroupBy(c => c.RiskLevel)
            .Select(g => new FilterOptionDto
            {
                Key = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ToListAsync();

        var ticketTypes = await db.SupportTickets.AsNoTracking()
            .GroupBy(t => t.Type)
            .Select(g => new FilterOptionDto
            {
                Key = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ToListAsync();

        var wilayaCounts = await db.Customers.AsNoTracking()
            .GroupBy(c => c.Wilaya)
            .Select(g => new { Key = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToListAsync();

        var wilayas = wilayaCounts
            .Select(x => new WilayaFilterOptionDto
            {
                Key = x.Key,
                Label = WilayaNames.TryGetValue(x.Key, out var name) ? name : $"Wilaya {x.Key}",
                Count = x.Count
            })
            .ToList();

        var totals = new FilterTotalsDto
        {
            Customers = await db.Customers.AsNoTracking().CountAsync(),
            BlacklistedCustomers = await db.Customers.AsNoTracking().CountAsync(c => c.IsBlacklisted),
            OpenTickets = await db.SupportTickets.AsNoTracking()
                .CountAsync(t => t.Status != TicketStatus.Closed && t.Status != TicketStatus.Resolved)
        };

        return new CrmFilterMetadataDto
        {
            Segments = segments,
            RiskLevels = riskLevels,
            TicketTypes = ticketTypes,
            Wilayas = wilayas,
            Totals = totals
        };
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────
    public async Task<Customer?> GetByIdAsync(Guid id)
        => await db.Customers.FindAsync(id);

    /// <summary>Loads customer with Tickets and Interactions included (for the detail view).</summary>
    public async Task<Customer?> GetByIdWithDetailsAsync(Guid id)
        => await db.Customers
            .Include(c => c.Tickets)
            .Include(c => c.Interactions)
            .FirstOrDefaultAsync(c => c.Id == id);

    /// <summary>Fetches the order history for a client by phone number from the Dashboard Orders table.</summary>
    public async Task<List<engine_b.Modules.Dashboard.Domain.Order>> GetOrdersByPhoneAsync(string phone)
        => await db.Orders
            .Where(o => o.ClientPhone == phone)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task AddAsync(Customer customer)
    {
        db.Customers.Add(customer);
        await db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Customer customer)
    {
        db.Customers.Update(customer);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Customer customer)
    {
        db.Customers.Remove(customer);
        await db.SaveChangesAsync();
    }

    // ── Phone lookup (incoming call) ─────────────────────────────────────────
    public async Task<Customer?> LookupByPhoneAsync(string phone)
        => await db.Customers.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Phone.Replace(" ", "") == phone.Replace(" ", ""));

    // ── Bulk access (for batch jobs) ─────────────────────────────────────────
    public IQueryable<Customer> QueryAll() => db.Customers;
}

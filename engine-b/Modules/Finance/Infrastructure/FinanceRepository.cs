using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Finance.Domain;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Finance.Infrastructure;

public class FinanceRepository(AppDbContext db)
{
    // ── Invoices ─────────────────────────────────────────────────────────────

    public IQueryable<Invoice> InvoicesQuery()
        => db.Set<Invoice>().AsQueryable();

    public async Task<Invoice?> GetInvoiceByIdAsync(Guid id)
        => await db.Set<Invoice>().FindAsync(id);

    public async Task<Invoice?> GetInvoiceByOrderIdAsync(Guid orderId)
        => await db.Set<Invoice>().FirstOrDefaultAsync(i => i.OrderId == orderId);

    public async Task AddInvoiceAsync(Invoice invoice)
    {
        db.Set<Invoice>().Add(invoice);
        await db.SaveChangesAsync();
    }

    public async Task UpdateInvoiceAsync(Invoice invoice)
    {
        db.Set<Invoice>().Update(invoice);
        await db.SaveChangesAsync();
    }

    public async Task<int> GetInvoiceSequenceAsync()
        => await db.Set<Invoice>().CountAsync() + 1;

    // ── Journal Entries ──────────────────────────────────────────────────────

    public IQueryable<JournalEntry> JournalEntriesQuery()
        => db.Set<JournalEntry>()
            .Include(j => j.Period)
            .Include(j => j.Invoice)
            .AsQueryable();

    public async Task AddJournalEntryAsync(JournalEntry entry)
    {
        db.Set<JournalEntry>().Add(entry);
        await db.SaveChangesAsync();
    }

    public async Task<int> GetJournalEntrySequenceAsync()
        => await db.Set<JournalEntry>().CountAsync() + 1;

    // ── Accounting Periods ───────────────────────────────────────────────────

    public async Task<List<AccountingPeriod>> GetPeriodsAsync()
        => await db.Set<AccountingPeriod>()
            .Include(p => p.JournalEntries)
            .OrderByDescending(p => p.StartDate)
            .ToListAsync();

    public async Task<AccountingPeriod?> GetPeriodByIdAsync(Guid id)
        => await db.Set<AccountingPeriod>()
            .Include(p => p.JournalEntries)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<AccountingPeriod?> GetCurrentPeriodAsync()
        => await db.Set<AccountingPeriod>()
            .Include(p => p.JournalEntries)
            .Where(p => p.Status == PeriodStatus.Open)
            .OrderByDescending(p => p.StartDate)
            .FirstOrDefaultAsync();

    public async Task<AccountingPeriod?> GetPeriodForDateAsync(DateTime date)
        => await db.Set<AccountingPeriod>()
            .Include(p => p.JournalEntries)
            .Where(p => p.StartDate <= date && p.EndDate >= date)
            .FirstOrDefaultAsync();

    public async Task AddPeriodAsync(AccountingPeriod period)
    {
        db.Set<AccountingPeriod>().Add(period);
        await db.SaveChangesAsync();
    }

    public async Task UpdatePeriodAsync(AccountingPeriod period)
    {
        db.Set<AccountingPeriod>().Update(period);
        await db.SaveChangesAsync();
    }

    // ── FIFO Layers ──────────────────────────────────────────────────────────

    public async Task<List<FifoLayer>> GetFifoLayersAsync()
        => await db.Set<FifoLayer>()
            .Where(f => f.Quantity > 0)
            .OrderBy(f => f.ReceivedAt)
            .ToListAsync();

    public async Task<List<FifoLayer>> GetFifoLayersByWarehouseAsync(string warehouse)
        => await db.Set<FifoLayer>()
            .Where(f => f.Quantity > 0 && f.Warehouse == warehouse)
            .OrderBy(f => f.ReceivedAt)
            .ToListAsync();

    public async Task AddFifoLayerAsync(FifoLayer layer)
    {
        db.Set<FifoLayer>().Add(layer);
        await db.SaveChangesAsync();
    }
}

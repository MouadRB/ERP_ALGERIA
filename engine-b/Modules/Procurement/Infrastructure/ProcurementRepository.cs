using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Procurement.Domain;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Procurement.Infrastructure;

public class ProcurementRepository(AppDbContext db)
{
    public IQueryable<PurchaseOrder> PurchaseOrdersQuery()
        => db.Set<PurchaseOrder>()
            .Include(p => p.Supplier)
            .Include(p => p.Lines)
            .Include(p => p.AuditEvents)
            .AsQueryable();

    public async Task<PurchaseOrder?> GetPurchaseOrderAsync(Guid id)
        => await PurchaseOrdersQuery().FirstOrDefaultAsync(p => p.Id == id);

    public async Task AddPurchaseOrderAsync(PurchaseOrder po)
    {
        db.Set<PurchaseOrder>().Add(po);
        await db.SaveChangesAsync();
    }

    public async Task UpdatePurchaseOrderAsync(PurchaseOrder po)
    {
        db.Set<PurchaseOrder>().Update(po);
        await db.SaveChangesAsync();
    }

    public async Task<List<Supplier>> GetSuppliersAsync()
        => await db.Set<Supplier>()
            .OrderByDescending(s => s.ReliabilityScore)
            .ToListAsync();

    public async Task<Supplier?> GetSupplierAsync(Guid id)
        => await db.Set<Supplier>().FindAsync(id);

    public async Task<List<ProcurementStockAlert>> GetActiveStockAlertsAsync()
        => await db.Set<ProcurementStockAlert>()
            .Where(a => !a.IsResolved)
            .OrderByDescending(a => a.Severity)
            .ThenByDescending(a => a.DetectedAt)
            .ToListAsync();

    public async Task<List<ProcurementReceipt>> GetRecentReceiptsAsync(int take = 20)
        => await db.Set<ProcurementReceipt>()
            .Include(r => r.PurchaseOrder)
            .OrderByDescending(r => r.ReceivedAt)
            .Take(take)
            .ToListAsync();

    public async Task AddReceiptAsync(ProcurementReceipt receipt)
    {
        db.Set<ProcurementReceipt>().Add(receipt);
        await db.SaveChangesAsync();
    }

    public async Task AddAuditEventAsync(PurchaseOrderAuditEvent evt)
    {
        db.Set<PurchaseOrderAuditEvent>().Add(evt);
        await db.SaveChangesAsync();
    }

    public async Task<List<PurchaseOrderAuditEvent>> GetAuditEventsAsync(Guid purchaseOrderId)
        => await db.Set<PurchaseOrderAuditEvent>()
            .Where(x => x.PurchaseOrderId == purchaseOrderId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
}

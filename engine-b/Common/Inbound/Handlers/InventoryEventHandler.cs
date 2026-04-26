using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Procurement.Domain;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Common.Inbound.Handlers;

/// <summary>
/// Reacts to engine-a inventory events.
/// - ReorderTriggered → mirror as a ProcurementStockAlert so engine-b's procurement
///   dashboard surfaces it and the manager can group it into a PO.
/// - StockZero / StockReplenished → updates an existing alert's resolution flag.
/// - CostUpdated → recorded as audit only (FIFO layers come from PO receipts).
/// </summary>
public class InventoryEventHandler(AppDbContext db, ILogger<InventoryEventHandler> log) : IEventHandler
{
    private static readonly HashSet<string> Handled =
    [
        "ReorderTriggered", "StockZero", "StockReplenished", "CostUpdated",
    ];

    public bool CanHandle(string eventType) => Handled.Contains(eventType);

    public async Task HandleAsync(EventEnvelope env, CancellationToken ct)
    {
        var p = PayloadJson.Parse(env.Payload);
        var sku = p.Str("skuCode") ?? env.AggregateId;

        switch (env.EventType)
        {
            case "ReorderTriggered":
                await UpsertAlert(sku, p, ct);
                break;

            case "StockZero":
                await UpsertAlert(sku, p, ct, severity: AlertSeverity.Critical);
                break;

            case "StockReplenished":
                await ResolveAlerts(sku, ct);
                break;

            case "CostUpdated":
                log.LogInformation("Cost updated for {Sku}: fifo={Fifo} avg={Avg} po={Po}",
                    sku, p.Dec("costFifo"), p.Dec("costWeightedAvg"), p.Str("purchaseOrderRef"));
                break;
        }
    }

    private async Task UpsertAlert(string sku, System.Text.Json.JsonElement p, CancellationToken ct,
        AlertSeverity severity = AlertSeverity.Warning)
    {
        var existing = await db.ProcurementStockAlerts
            .FirstOrDefaultAsync(a => a.Sku == sku && !a.IsResolved, ct);
        if (existing is not null) return;

        db.ProcurementStockAlerts.Add(new ProcurementStockAlert
        {
            Sku = sku,
            ProductName = sku,
            AvailableUnits = p.Int("currentStock") ?? 0,
            ReorderThreshold = p.Int("threshold") ?? 0,
            SuggestedOrderQty = p.Int("suggestedQuantity") ?? 0,
            SupplierName = p.Str("supplierCode") ?? string.Empty,
            Severity = severity,
            IsResolved = false,
            DetectedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
        log.LogInformation("Mirrored stock alert for {Sku}", sku);
    }

    private async Task ResolveAlerts(string sku, CancellationToken ct)
    {
        var open = await db.ProcurementStockAlerts.Where(a => a.Sku == sku && !a.IsResolved).ToListAsync(ct);
        foreach (var a in open) a.IsResolved = true;
        if (open.Count > 0) await db.SaveChangesAsync(ct);
    }
}

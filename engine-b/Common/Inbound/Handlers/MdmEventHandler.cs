using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Procurement.Domain;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Common.Inbound.Handlers;

/// <summary>
/// Mirrors MDM master data into engine-b read-side caches.
/// - SUPPLIER_REGISTERED / SUPPLIER_UPDATED → upsert proc_suppliers row.
/// - SKU_REGISTERED / SKU_ACTIVATED → no engine-b SKU table; logged for audit.
/// </summary>
public class MdmEventHandler(AppDbContext db, ILogger<MdmEventHandler> log) : IEventHandler
{
    private static readonly HashSet<string> Handled =
    [
        "SUPPLIER_REGISTERED", "SUPPLIER_UPDATED",
        "SKU_REGISTERED", "SKU_ACTIVATED", "SKU_UPDATED", "SKU_DISCONTINUED",
    ];

    public bool CanHandle(string eventType) => Handled.Contains(eventType);

    public async Task HandleAsync(EventEnvelope env, CancellationToken ct)
    {
        var p = PayloadJson.Parse(env.Payload);

        switch (env.EventType)
        {
            case "SUPPLIER_REGISTERED":
            case "SUPPLIER_UPDATED":
                await UpsertSupplier(p, env.AggregateId, ct);
                break;

            default:
                log.LogInformation("MDM event {EventType} for {Sku} acknowledged",
                    env.EventType, p.Str("skuCode") ?? env.AggregateId);
                break;
        }
    }

    private async Task UpsertSupplier(System.Text.Json.JsonElement p, string aggregateId, CancellationToken ct)
    {
        var code = p.Str("supplierCode") ?? aggregateId;
        var name = p.Str("companyName") ?? code;

        var existing = await db.Suppliers.FirstOrDefaultAsync(s => s.Name == name, ct);
        if (existing is not null)
        {
            log.LogDebug("Supplier {Name} already mirrored", name);
            return;
        }

        db.Suppliers.Add(new Supplier
        {
            Name = name,
            Country = p.Str("wilayaCode") ?? string.Empty,
            City = string.Empty,
            ContactName = p.Str("createdBy") ?? string.Empty,
            Email = string.Empty,
            Phone = string.Empty,
        });
        await db.SaveChangesAsync(ct);
        log.LogInformation("Mirrored supplier {Code} / {Name} from MDM", code, name);
    }
}

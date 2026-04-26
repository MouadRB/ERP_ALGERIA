using engine_b.Modules.CRM.Application;
using engine_b.Modules.CRM.Application.Dtos;
using engine_b.Modules.Finance.Application;

namespace engine_b.Common.Inbound.Handlers;

/// <summary>
/// Reacts to OMS order lifecycle events from engine-a.
/// - OMS_ORDER_RECEIVED   → upsert customer in CRM, log "new order" interaction
/// - OMS_ORDER_CONFIRMED  → log "order confirmed" interaction
/// - OMS_ORDER_COMPLETED  → auto-generate invoice in Finance
/// - OMS_ORDER_CANCELLED  → log "order cancelled" interaction
/// </summary>
public class OmsOrderEventHandler(
    CustomerService customers,
    CustomerInteractionService interactions,
    InvoiceService invoices,
    ILogger<OmsOrderEventHandler> log) : IEventHandler
{
    private static readonly HashSet<string> Handled =
    [
        "OMS_ORDER_RECEIVED", "OMS_ORDER_CONFIRMED", "OMS_ORDER_COMPLETED",
        "OMS_ORDER_CANCELLED", "OMS_ORDER_REJECTED", "OMS_SHIPMENT_DELIVERED",
    ];

    public bool CanHandle(string eventType) => Handled.Contains(eventType);

    public async Task HandleAsync(EventEnvelope env, CancellationToken ct)
    {
        var p = PayloadJson.Parse(env.Payload);
        var orderId = env.AggregateId;
        var orderNumber = p.Str("externalOrderRef") ?? p.Str("orderNumber") ?? orderId;
        var phone = p.Str("customerPhone") ?? p.Str("phone");
        var name = p.Str("customerName") ?? p.Str("customerFullName");
        var wilaya = p.Int("wilaya") ?? 16;
        var amount = p.Dec("grandTotalTtc") ?? p.Dec("amount") ?? 0m;

        var customerId = !string.IsNullOrWhiteSpace(phone)
            ? await UpsertCustomer(phone, name, wilaya, ct)
            : (Guid?)null;

        switch (env.EventType)
        {
            case "OMS_ORDER_RECEIVED":
                await LogInteraction(customerId, $"Nouvelle commande {orderNumber} reçue.", ct);
                break;

            case "OMS_ORDER_CONFIRMED":
                await LogInteraction(customerId, $"Commande {orderNumber} confirmée.", ct);
                break;

            case "OMS_ORDER_CANCELLED":
            case "OMS_ORDER_REJECTED":
                await LogInteraction(customerId, $"Commande {orderNumber} annulée/refusée.", ct);
                break;

            case "OMS_ORDER_COMPLETED":
            case "OMS_SHIPMENT_DELIVERED":
                if (Guid.TryParse(orderId, out var orderGuid) && amount > 0 && !string.IsNullOrWhiteSpace(phone))
                {
                    var result = await invoices.GenerateFromOrderAsync(
                        orderGuid, orderNumber, name ?? "Client", phone, wilaya, amount,
                        actor: "System (engine-a OMS)");
                    log.LogInformation("Invoice from order {OrderId}: {Message}", orderId, result.Message);
                }
                await LogInteraction(customerId, $"Commande {orderNumber} livrée.", ct);
                break;
        }
    }

    private async Task<Guid?> UpsertCustomer(string phone, string? name, int wilaya, CancellationToken ct)
    {
        _ = ct;
        var existing = await customers.LookupByPhoneAsync(phone);
        if (existing is not null) return existing.Id;

        var created = await customers.CreateCustomerAsync(new CreateCustomerRequest(
            FullName: name ?? "Client (auto)",
            Phone: phone,
            Wilaya: wilaya,
            City: string.Empty));
        log.LogInformation("Created CRM customer {CustomerId} from OMS event", created.Id);
        return created.Id;
    }

    private async Task LogInteraction(Guid? customerId, string content, CancellationToken ct)
    {
        _ = ct;
        if (customerId is null) return;
        await interactions.AddInteractionAsync(
            customerId.Value,
            new CreateInteractionRequest(customerId.Value, content, Type: "Note"),
            agentName: "System (engine-a OMS)");
    }
}

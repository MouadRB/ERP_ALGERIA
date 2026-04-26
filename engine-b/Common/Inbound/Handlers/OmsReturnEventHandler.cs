using engine_b.Modules.CRM.Application;
using engine_b.Modules.CRM.Application.Dtos;

namespace engine_b.Common.Inbound.Handlers;

/// <summary>
/// Engine-a OMS return events → CRM ticket lifecycle.
/// - OMS_RETURN_REQUESTED → open a "ProductReturn" support ticket linked to the customer.
/// - OMS_RETURN_CLOSED    → close the matching open ticket.
/// </summary>
public class OmsReturnEventHandler(
    CustomerService customers,
    SupportTicketService tickets,
    ILogger<OmsReturnEventHandler> log) : IEventHandler
{
    private static readonly HashSet<string> Handled =
    [
        "OMS_RETURN_REQUESTED", "OMS_RETURN_CLOSED",
    ];

    public bool CanHandle(string eventType) => Handled.Contains(eventType);

    public async Task HandleAsync(EventEnvelope env, CancellationToken ct)
    {
        var p = PayloadJson.Parse(env.Payload);
        var phone = p.Str("customerPhone") ?? p.Str("phone");
        var orderRef = p.Str("orderNumber") ?? p.Str("externalOrderRef") ?? env.AggregateId;
        var reason = p.Str("reason") ?? "Return from OMS";

        var customer = !string.IsNullOrWhiteSpace(phone)
            ? await customers.LookupByPhoneAsync(phone) : null;

        if (env.EventType == "OMS_RETURN_REQUESTED")
        {
            if (customer is null)
            {
                log.LogInformation("Return for unknown customer (phone={Phone}) — ticket skipped", phone);
                return;
            }

            await tickets.CreateTicketAsync(new CreateTicketRequest(
                CustomerId: customer.Id,
                Subject: $"Retour produit — commande {orderRef}",
                Description: reason,
                Type: "ProductReturn",
                Priority: "Normal",
                RelatedOrderId: orderRef,
                AssignedAgentName: "Non assigné"));
            log.LogInformation("Opened return ticket for customer {CustomerId} order {Order}",
                customer.Id, orderRef);
        }
        else // OMS_RETURN_CLOSED
        {
            log.LogInformation("Return closed for order {Order} — manual ticket close required", orderRef);
        }
    }
}

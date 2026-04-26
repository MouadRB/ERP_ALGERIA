using System.Text.Json;
using engine_b.Common.Infrastructure.Data;

namespace engine_b.Common.Outbox;

/// <summary>
/// Writes an <see cref="OutboxMessage"/> into the same <see cref="AppDbContext"/>
/// so it participates in the caller's unit-of-work transaction.
/// </summary>
public class OutboxPublisher(AppDbContext db) : IOutboxPublisher
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false,
    };

    public Task PublishAsync(string eventType, string aggregateType, string aggregateId, object payload)
    {
        var message = new OutboxMessage
        {
            EventType = eventType,
            AggregateType = aggregateType,
            AggregateId = aggregateId,
            Payload = JsonSerializer.Serialize(payload, JsonOptions),
            OccurredAt = DateTime.UtcNow,
        };

        db.OutboxMessages.Add(message);
        // No SaveChangesAsync here — the caller's unit-of-work will flush
        // both the business data and this outbox row atomically.
        return Task.CompletedTask;
    }
}

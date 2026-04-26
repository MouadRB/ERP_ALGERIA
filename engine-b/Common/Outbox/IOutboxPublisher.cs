namespace engine_b.Common.Outbox;

/// <summary>
/// Abstraction for publishing domain events into the transactional outbox.
/// Services call this within their existing EF Core transaction scope
/// so the event is persisted atomically with the business data change.
/// </summary>
public interface IOutboxPublisher
{
    /// <summary>
    /// Enqueue a domain event into the outbox table.
    /// </summary>
    /// <param name="eventType">Dot-separated event type, e.g. "order.confirmed".</param>
    /// <param name="aggregateType">Name of the aggregate root, e.g. "Order".</param>
    /// <param name="aggregateId">ID of the aggregate root instance.</param>
    /// <param name="payload">Event data object (will be JSON-serialized).</param>
    Task PublishAsync(string eventType, string aggregateType, string aggregateId, object payload);
}

namespace engine_b.Common.Outbox;

/// <summary>
/// Represents a domain event stored in the outbox table.
/// Written in the same DB transaction as the business operation,
/// guaranteeing at-least-once delivery to external consumers.
/// </summary>
public class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Dot-separated event type, e.g. "order.confirmed".</summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>The aggregate root type, e.g. "Order", "Customer", "PurchaseOrder".</summary>
    public string AggregateType { get; set; } = string.Empty;

    /// <summary>The aggregate root ID (usually a GUID string).</summary>
    public string AggregateId { get; set; } = string.Empty;

    /// <summary>JSON-serialized event payload.</summary>
    public string Payload { get; set; } = string.Empty;

    /// <summary>When the domain event occurred.</summary>
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    /// <summary>When the message was successfully dispatched. Null = not yet processed.</summary>
    public DateTime? ProcessedAt { get; set; }

    /// <summary>Last error encountered during dispatch.</summary>
    public string? Error { get; set; }

    /// <summary>Number of failed dispatch attempts.</summary>
    public int RetryCount { get; set; }
}

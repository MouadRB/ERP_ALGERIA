namespace engine_b.Common.Inbound;

public class EventEnvelope
{
    public string EventId { get; set; } = string.Empty;
    public string AggregateType { get; set; } = string.Empty;
    public string AggregateId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public int EventVersion { get; set; }
    public string? TenantId { get; set; }
    public string Payload { get; set; } = "{}";
    public string CreatedAt { get; set; } = string.Empty;
}

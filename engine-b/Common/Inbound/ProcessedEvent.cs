namespace engine_b.Common.Inbound;

public class ProcessedEvent
{
    public Guid EventId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}

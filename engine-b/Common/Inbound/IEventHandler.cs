namespace engine_b.Common.Inbound;

public interface IEventHandler
{
    bool CanHandle(string eventType);
    Task HandleAsync(EventEnvelope envelope, CancellationToken ct);
}

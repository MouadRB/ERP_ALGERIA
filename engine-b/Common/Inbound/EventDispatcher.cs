using engine_b.Common.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Common.Inbound;

public class EventDispatcher(
    AppDbContext db,
    IEnumerable<IEventHandler> handlers,
    ILogger<EventDispatcher> log)
{
    public async Task<DispatchResult> DispatchAsync(EventEnvelope env, CancellationToken ct)
    {
        if (!Guid.TryParse(env.EventId, out var eventGuid))
            return DispatchResult.Rejected;

        if (await db.Set<ProcessedEvent>().AnyAsync(p => p.EventId == eventGuid, ct))
        {
            log.LogDebug("Skipping duplicate event {EventId} ({EventType})", env.EventId, env.EventType);
            return DispatchResult.Duplicate;
        }

        var matches = handlers.Where(h => h.CanHandle(env.EventType)).ToList();
        if (matches.Count == 0)
        {
            log.LogDebug("No handler for {EventType} — skipping", env.EventType);
            await MarkProcessed(eventGuid, env, ct);
            return DispatchResult.NoHandler;
        }

        foreach (var handler in matches)
        {
            try { await handler.HandleAsync(env, ct); }
            catch (Exception ex)
            {
                log.LogError(ex, "Handler {Handler} failed for {EventType} {EventId}",
                    handler.GetType().Name, env.EventType, env.EventId);
                throw;
            }
        }

        await MarkProcessed(eventGuid, env, ct);
        return DispatchResult.Handled;
    }

    private async Task MarkProcessed(Guid id, EventEnvelope env, CancellationToken ct)
    {
        db.Set<ProcessedEvent>().Add(new ProcessedEvent
        {
            EventId = id,
            EventType = env.EventType,
            Source = env.AggregateType,
            ProcessedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
    }
}

public enum DispatchResult { Handled, Duplicate, NoHandler, Rejected }

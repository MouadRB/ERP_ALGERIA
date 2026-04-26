using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace engine_b.Common.Inbound;

[ApiController]
[Route("api/events")]
[AllowAnonymous]
public class EventsIngestController(EventDispatcher dispatcher, ILogger<EventsIngestController> log)
    : ControllerBase
{
    [HttpPost("ingest")]
    public async Task<IActionResult> Ingest([FromBody] EventEnvelope envelope, CancellationToken ct)
    {
        if (envelope is null || string.IsNullOrWhiteSpace(envelope.EventId)
                             || string.IsNullOrWhiteSpace(envelope.EventType))
            return BadRequest(new { error = "envelope missing eventId or eventType" });

        var result = await dispatcher.DispatchAsync(envelope, ct);
        log.LogInformation("Ingested {EventType} {EventId} → {Result}",
            envelope.EventType, envelope.EventId, result);

        return Ok(new { eventId = envelope.EventId, result = result.ToString() });
    }
}

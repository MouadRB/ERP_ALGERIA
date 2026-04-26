using engine_b.Common.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Common.Outbox;

/// <summary>
/// Read-only polling API for external engines that prefer pulling events
/// instead of receiving webhooks. Also supports manual acknowledgement.
/// </summary>
[ApiController]
[Route("api/outbox")]
[Authorize(Policy = "OutboxRead")]
public class OutboxController(AppDbContext db) : ControllerBase
{
    /// <summary>
    /// Returns unprocessed (or recently processed) outbox messages.
    /// External consumers can call this on a schedule to fetch new events.
    /// </summary>
    /// <param name="since">Optional UTC timestamp — only return messages that occurred after this time.</param>
    /// <param name="includeProcessed">If true, also return already-processed messages (for replay).</param>
    /// <param name="limit">Max number of messages to return (default 50, max 200).</param>
    [HttpGet]
    public async Task<IActionResult> GetMessages(
        [FromQuery] DateTime? since,
        [FromQuery] bool includeProcessed = false,
        [FromQuery] int limit = 50)
    {
        limit = Math.Clamp(limit, 1, 200);

        var query = db.OutboxMessages.AsQueryable();

        if (since.HasValue)
            query = query.Where(m => m.OccurredAt > since.Value);

        if (!includeProcessed)
            query = query.Where(m => m.ProcessedAt == null);

        var messages = await query
            .OrderBy(m => m.OccurredAt)
            .Take(limit)
            .Select(m => new
            {
                m.Id,
                m.EventType,
                m.AggregateType,
                m.AggregateId,
                m.Payload,
                m.OccurredAt,
                m.ProcessedAt,
                m.RetryCount,
            })
            .ToListAsync();

        return Ok(messages);
    }

    /// <summary>
    /// Acknowledge (mark as processed) a specific outbox message.
    /// Used by external consumers polling the GET endpoint — once they have
    /// successfully handled the event, they call this to mark it done.
    /// </summary>
    [HttpPost("{id:guid}/ack")]
    [Authorize(Policy = "OutboxWrite")]
    public async Task<IActionResult> Acknowledge(Guid id)
    {
        var message = await db.OutboxMessages.FindAsync(id);
        if (message is null)
            return NotFound(new { error = "Message not found." });

        if (message.ProcessedAt.HasValue)
            return Ok(new { message = "Already acknowledged.", processedAt = message.ProcessedAt });

        message.ProcessedAt = DateTime.UtcNow;
        message.Error = null;
        await db.SaveChangesAsync();

        return Ok(new { message = "Acknowledged.", processedAt = message.ProcessedAt });
    }

    /// <summary>
    /// Returns a summary of outbox health: pending count, failed count, last processed time.
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var pending = await db.OutboxMessages.CountAsync(m => m.ProcessedAt == null);
        var failed = await db.OutboxMessages.CountAsync(m => m.ProcessedAt == null && m.RetryCount >= 5);
        var lastProcessed = await db.OutboxMessages
            .Where(m => m.ProcessedAt != null)
            .OrderByDescending(m => m.ProcessedAt)
            .Select(m => m.ProcessedAt)
            .FirstOrDefaultAsync();
        var total = await db.OutboxMessages.CountAsync();

        return Ok(new
        {
            totalMessages = total,
            pendingMessages = pending,
            failedMessages = failed,
            lastProcessedAt = lastProcessed,
        });
    }
}

using System.Net.Http.Json;
using engine_b.Common.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace engine_b.Common.Outbox;

/// <summary>
/// Background worker that polls the outbox table for unprocessed messages
/// and forwards them to configured webhook URLs.
/// Implements at-least-once delivery with configurable retry and back-off.
/// </summary>
public class OutboxDispatcher(
    IServiceScopeFactory scopeFactory,
    IOptions<OutboxSettings> options,
    ILogger<OutboxDispatcher> logger) : BackgroundService
{
    private readonly OutboxSettings _settings = options.Value;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation(
            "OutboxDispatcher started. Polling every {Interval}s, batch size {Batch}, max retries {Retries}.",
            _settings.PollingIntervalSeconds, _settings.BatchSize, _settings.MaxRetries);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await DispatchPendingMessagesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "OutboxDispatcher encountered an error during polling cycle.");
            }

            await Task.Delay(TimeSpan.FromSeconds(_settings.PollingIntervalSeconds), stoppingToken);
        }
    }

    private async Task DispatchPendingMessagesAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var messages = await db.OutboxMessages
            .Where(m => m.ProcessedAt == null && m.RetryCount < _settings.MaxRetries)
            .OrderBy(m => m.OccurredAt)
            .Take(_settings.BatchSize)
            .ToListAsync(ct);

        if (messages.Count == 0) return;

        logger.LogInformation("OutboxDispatcher picked up {Count} message(s) for dispatch.", messages.Count);

        using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };

        foreach (var message in messages)
        {
            var envelope = new
            {
                eventId = message.Id.ToString(),
                aggregateType = message.AggregateType,
                aggregateId = message.AggregateId,
                eventType = message.EventType,
                eventVersion = 1,
                tenantId = (string?)null,
                payload = message.Payload,
                createdAt = message.OccurredAt.ToString("O"),
            };

            var allSucceeded = true;

            foreach (var url in _settings.WebhookUrls)
            {
                try
                {
                    var response = await httpClient.PostAsJsonAsync(url, envelope, ct);

                    if (!response.IsSuccessStatusCode)
                    {
                        var body = await response.Content.ReadAsStringAsync(ct);
                        logger.LogWarning(
                            "Webhook {Url} returned {StatusCode} for message {Id}: {Body}",
                            url, (int)response.StatusCode, message.Id, body);
                        allSucceeded = false;
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Webhook {Url} failed for message {Id}.", url, message.Id);
                    allSucceeded = false;
                }
            }

            if (allSucceeded || _settings.WebhookUrls.Count == 0)
            {
                message.ProcessedAt = DateTime.UtcNow;
                message.Error = null;
                logger.LogDebug("Message {Id} ({EventType}) dispatched successfully.", message.Id, message.EventType);
            }
            else
            {
                message.RetryCount++;
                message.Error = $"Failed on attempt {message.RetryCount} at {DateTime.UtcNow:O}";
                logger.LogWarning(
                    "Message {Id} ({EventType}) dispatch failed. Retry {Retry}/{Max}.",
                    message.Id, message.EventType, message.RetryCount, _settings.MaxRetries);
            }
        }

        await db.SaveChangesAsync(ct);
    }
}

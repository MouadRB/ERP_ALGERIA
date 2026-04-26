using engine_b.Common.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace engine_b.Common.Outbox;

/// <summary>
/// Periodic cleanup job that deletes successfully processed outbox messages
/// older than the configured retention window, preventing table bloat.
/// </summary>
public class OutboxCleanupJob(
    IServiceScopeFactory scopeFactory,
    IOptions<OutboxSettings> options,
    ILogger<OutboxCleanupJob> logger) : BackgroundService
{
    private readonly OutboxSettings _settings = options.Value;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation(
            "OutboxCleanupJob started. Runs every {Hours}h, retains {Days} days.",
            _settings.CleanupIntervalHours, _settings.RetentionDays);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "OutboxCleanupJob encountered an error.");
            }

            await Task.Delay(TimeSpan.FromHours(_settings.CleanupIntervalHours), stoppingToken);
        }
    }

    private async Task CleanupAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoff = DateTime.UtcNow.AddDays(-_settings.RetentionDays);

        var deleted = await db.OutboxMessages
            .Where(m => m.ProcessedAt != null && m.ProcessedAt < cutoff)
            .ExecuteDeleteAsync(ct);

        if (deleted > 0)
            logger.LogInformation("OutboxCleanupJob purged {Count} processed message(s) older than {Cutoff:yyyy-MM-dd}.", deleted, cutoff);
    }
}

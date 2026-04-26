namespace engine_b.Common.Outbox;

/// <summary>
/// Configuration POCO bound from the "Outbox" section of appsettings.json.
/// </summary>
public class OutboxSettings
{
    /// <summary>How often (in seconds) the dispatcher polls for unprocessed messages.</summary>
    public int PollingIntervalSeconds { get; set; } = 5;

    /// <summary>Maximum number of retries before a message is considered dead.</summary>
    public int MaxRetries { get; set; } = 5;

    /// <summary>
    /// Webhook URLs that the dispatcher will POST events to.
    /// Each URL receives the full OutboxMessage payload as JSON.
    /// </summary>
    public List<string> WebhookUrls { get; set; } = [];

    /// <summary>Number of days to retain processed messages before cleanup.</summary>
    public int RetentionDays { get; set; } = 7;

    /// <summary>How often (in hours) the cleanup job runs.</summary>
    public int CleanupIntervalHours { get; set; } = 6;

    /// <summary>Maximum number of messages to process per polling cycle.</summary>
    public int BatchSize { get; set; } = 50;
}

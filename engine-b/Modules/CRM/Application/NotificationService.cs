using Microsoft.Extensions.Logging;

namespace engine_b.Modules.CRM.Application;

/// <summary>
/// Stub notification service — logs to console for now.
/// Replace with SMS gateway (e.g. Twilio / Cequens) when ready.
/// </summary>
public class NotificationService(ILogger<NotificationService> logger)
{
    public Task SendSmsAsync(string phone, string message)
    {
        logger.LogInformation("[SMS → {Phone}] {Message}", phone, message);
        return Task.CompletedTask;
    }

    public Task SendEmailAsync(string email, string subject, string body)
    {
        logger.LogInformation("[Email → {Email}] {Subject}", email, subject);
        return Task.CompletedTask;
    }
}

namespace engine_b.Common.Email;

/// <summary>
/// Abstraction for sending emails. Swap implementations for testing or different providers.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send an email asynchronously.
    /// </summary>
    /// <param name="toEmail">Recipient email address.</param>
    /// <param name="subject">Email subject line.</param>
    /// <param name="htmlBody">HTML-formatted email body.</param>
    Task SendAsync(string toEmail, string subject, string htmlBody);
}

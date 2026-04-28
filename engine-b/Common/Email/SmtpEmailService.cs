using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace engine_b.Common.Email;

/// <summary>
/// Sends emails via SMTP using <see cref="System.Net.Mail.SmtpClient"/>.
/// No external NuGet packages required.
/// </summary>
public class SmtpEmailService(
    IOptions<SmtpSettings> options,
    ILogger<SmtpEmailService> logger) : IEmailService
{
    private readonly SmtpSettings _settings = options.Value;

    public async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_settings.SenderEmail, _settings.SenderName);
            message.To.Add(new MailAddress(toEmail));
            message.Subject = subject;
            message.Body = htmlBody;
            message.IsBodyHtml = true;

            using var client = new SmtpClient(_settings.Host, _settings.Port);
            client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
            client.EnableSsl = _settings.EnableSsl;

            await client.SendMailAsync(message);

            logger.LogInformation("Invitation email sent to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            // Don't throw — the invitation is already saved; email failure
            // should not roll back the invite. The token is also returned in
            // the API response as a fallback.
        }
    }
}

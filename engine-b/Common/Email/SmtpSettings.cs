namespace engine_b.Common.Email;

/// <summary>
/// SMTP configuration bound from appsettings.json section "Smtp".
/// </summary>
public class SmtpSettings
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderName { get; set; } = "ERP Algeria";
    public bool EnableSsl { get; set; } = true;
}

namespace engine_b.Modules.Dashboard.Application.Dtos;

/// <summary>One row in the "File de Confirmation" table.</summary>
public class ConfirmationQueueItemDto
{
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public int ClientOrderCount { get; set; }
    public bool IsNewClient { get; set; }
    public int Wilaya { get; set; }
    public decimal Amount { get; set; }
    public string Risk { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    /// <summary>Minutes since the order was placed (timer column).</summary>
    public int WaitingMinutes { get; set; }
}

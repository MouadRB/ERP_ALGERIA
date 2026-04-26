namespace engine_b.Modules.Dashboard.Domain;

/// <summary>Tracks out-of-stock articles for the dashboard KPI card.</summary>
public class StockAlert
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    public bool IsResolved { get; set; }
}

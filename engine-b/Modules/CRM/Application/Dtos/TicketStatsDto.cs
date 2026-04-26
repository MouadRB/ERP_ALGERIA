namespace engine_b.Modules.CRM.Application.Dtos;

/// <summary>Aggregated ticket counts for the File Support summary bar.</summary>
public class TicketStatsDto
{
    public int TotalCount { get; set; }
    public int OpenCount { get; set; }
    public int InProgressCount { get; set; }
    public int WaitingClientCount { get; set; }
    public int EscalatedCount { get; set; }
    public int ResolvedCount { get; set; }
    public int ClosedCount { get; set; }
}

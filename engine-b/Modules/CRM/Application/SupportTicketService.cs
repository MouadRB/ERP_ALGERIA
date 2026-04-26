using engine_b.Common.Outbox;
using engine_b.Modules.CRM.Application.Dtos;
using engine_b.Modules.CRM.Domain;
using engine_b.Modules.CRM.Infrastructure;

namespace engine_b.Modules.CRM.Application;

public class SupportTicketService(SupportTicketRepository repo, IOutboxPublisher outbox)
{
    private static TicketType ParseTicketType(string? rawType)
    {
        if (string.IsNullOrWhiteSpace(rawType)) return TicketType.Other;
        var normalized = rawType.Trim().ToLowerInvariant().Replace(" ", "").Replace("_", "").Replace("-", "");

        return normalized switch
        {
            "litigelivraison" or "deliverydispute" => TicketType.DeliveryDispute,
            "retourproduit" or "productreturn" => TicketType.ProductReturn,
            "erreurcommande" or "ordererror" => TicketType.OrderError,
            "doublecommande" => TicketType.OrderError,
            "fraude" or "fraudesuspectee" or "fraud" => TicketType.Fraud,
            "montantcodincorrect" or "codamountincorrect" => TicketType.CodAmountIncorrect,
            _ when Enum.TryParse<TicketType>(rawType, true, out var parsed) => parsed,
            _ => TicketType.Other
        };
    }

    // ── Paged list ───────────────────────────────────────────────────────────
    public async Task<PagedResult<SupportTicketDto>> GetTicketsAsync(TicketQueryParams query)
    {
        var result = await repo.GetPagedAsync(query);
        return new PagedResult<SupportTicketDto>
        {
            Items = result.Items.Select(SupportTicketDto.FromEntity).ToList(),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize,
        };
    }

    // ── Single ticket ────────────────────────────────────────────────────────
    public async Task<SupportTicketDto?> GetTicketByIdAsync(Guid id)
    {
        var ticket = await repo.GetByIdAsync(id);
        return ticket is null ? null : SupportTicketDto.FromEntity(ticket);
    }

    // ── Create ───────────────────────────────────────────────────────────────
    public async Task<SupportTicketDto> CreateTicketAsync(CreateTicketRequest request)
    {
        var ticket = new SupportTicket
        {
            CustomerId = request.CustomerId,
            Subject    = request.Subject,
            Description = request.Description ?? string.Empty,
            TicketNumber = $"#TKT-{Random.Shared.Next(1000, 9999)}",
            Type = ParseTicketType(request.Type),
            Priority = Enum.TryParse<TicketPriority>(request.Priority, true, out var p) ? p : TicketPriority.Normal,
            RelatedOrderId = request.RelatedOrderId,
            AssignedAgentName = request.AssignedAgentName,
            LastActionAt = DateTime.UtcNow
        };
        await repo.AddAsync(ticket);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("ticket.created", "SupportTicket", ticket.Id.ToString(), new
        {
            ticketId = ticket.Id,
            ticketNumber = ticket.TicketNumber,
            customerId = ticket.CustomerId,
            subject = ticket.Subject,
            type = ticket.Type.ToString(),
            priority = ticket.Priority.ToString(),
            relatedOrderId = ticket.RelatedOrderId,
            createdAt = ticket.CreatedAt,
        });

        // Re-fetch with Customer include for the DTO
        var saved = await repo.GetByIdAsync(ticket.Id);
        return SupportTicketDto.FromEntity(saved!);
    }

    // ── Update ───────────────────────────────────────────────────────────────
    public async Task<SupportTicketDto?> UpdateTicketAsync(Guid id, UpdateTicketRequest request)
    {
        var ticket = await repo.GetByIdAsync(id);
        if (ticket is null) return null;

        if (request.Subject is not null) ticket.Subject = request.Subject;
        if (request.Status is not null && Enum.TryParse<TicketStatus>(request.Status, true, out var s)) ticket.Status = s;
        if (request.Type is not null) ticket.Type = ParseTicketType(request.Type);
        if (request.Priority is not null && Enum.TryParse<TicketPriority>(request.Priority, true, out var p)) ticket.Priority = p;
        if (request.RelatedOrderId is not null) ticket.RelatedOrderId = request.RelatedOrderId;
        if (request.AssignedAgentName is not null) ticket.AssignedAgentName = request.AssignedAgentName;
        
        ticket.LastActionAt = DateTime.UtcNow;

        await repo.UpdateAsync(ticket);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("ticket.updated", "SupportTicket", ticket.Id.ToString(), new
        {
            ticketId = ticket.Id,
            ticketNumber = ticket.TicketNumber,
            customerId = ticket.CustomerId,
            status = ticket.Status.ToString(),
            type = ticket.Type.ToString(),
            priority = ticket.Priority.ToString(),
            updatedAt = ticket.LastActionAt,
        });

        return SupportTicketDto.FromEntity(ticket);
    }

    // ── Delete ───────────────────────────────────────────────────────────────
    public async Task<bool> DeleteTicketAsync(Guid id)
    {
        var ticket = await repo.GetByIdAsync(id);
        if (ticket is null) return false;
        await repo.DeleteAsync(ticket);
        return true;
    }

    // ── Escalate ─────────────────────────────────────────────────────────────
    public async Task<bool> EscalateAsync(Guid id)
    {
        var ticket = await repo.GetByIdAsync(id);
        if (ticket is null || ticket.Status == TicketStatus.Closed) return false;
        ticket.Status = TicketStatus.Escalated;
        ticket.LastActionAt = DateTime.UtcNow;
        await repo.UpdateAsync(ticket);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("ticket.escalated", "SupportTicket", ticket.Id.ToString(), new
        {
            ticketId = ticket.Id,
            ticketNumber = ticket.TicketNumber,
            customerId = ticket.CustomerId,
            subject = ticket.Subject,
            escalatedAt = ticket.LastActionAt,
        });

        return true;
    }

    // ── Close ────────────────────────────────────────────────────────────────
    public async Task<bool> CloseAsync(Guid id)
    {
        var ticket = await repo.GetByIdAsync(id);
        if (ticket is null || ticket.Status == TicketStatus.Closed) return false;
        ticket.Status = TicketStatus.Closed;
        ticket.ResolvedAt = DateTime.UtcNow;
        ticket.LastActionAt = DateTime.UtcNow;
        await repo.UpdateAsync(ticket);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("ticket.closed", "SupportTicket", ticket.Id.ToString(), new
        {
            ticketId = ticket.Id,
            ticketNumber = ticket.TicketNumber,
            customerId = ticket.CustomerId,
            resolvedAt = ticket.ResolvedAt,
        });

        return true;
    }

    // ── Assign ───────────────────────────────────────────────────────────────
    public async Task<bool> AssignAsync(Guid id, string agentName)
    {
        var ticket = await repo.GetByIdAsync(id);
        if (ticket is null) return false;
        ticket.AssignedAgentName = agentName;
        ticket.LastActionAt = DateTime.UtcNow;
        await repo.UpdateAsync(ticket);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("ticket.assigned", "SupportTicket", ticket.Id.ToString(), new
        {
            ticketId = ticket.Id,
            ticketNumber = ticket.TicketNumber,
            customerId = ticket.CustomerId,
            assignedAgent = agentName,
            assignedAt = ticket.LastActionAt,
        });

        return true;
    }

    // ── Ticket stats (summary bar counts) ───────────────────────────────────
    public async Task<TicketStatsDto> GetTicketStatsAsync()
    {
        var counts = await repo.GetCountsAsync();
        return new TicketStatsDto
        {
            TotalCount        = counts.Total,
            OpenCount         = counts.Open,
            InProgressCount   = counts.InProgress,
            WaitingClientCount = counts.WaitingClient,
            EscalatedCount    = counts.Escalated,
            ResolvedCount     = counts.Resolved,
            ClosedCount       = counts.Closed,
        };
    }
}

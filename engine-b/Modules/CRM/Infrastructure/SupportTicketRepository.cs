using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.CRM.Application.Dtos;
using engine_b.Modules.CRM.Domain;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.CRM.Infrastructure;

public class SupportTicketRepository(AppDbContext db)
{
    // ── Paged + Filtered list ────────────────────────────────────────────────
    public async Task<PagedResult<SupportTicket>> GetPagedAsync(TicketQueryParams q)
    {
        IQueryable<SupportTicket> query = db.SupportTickets
            .Include(t => t.Customer)
            .AsNoTracking();

        if (q.CustomerId.HasValue)
            query = query.Where(t => t.CustomerId == q.CustomerId.Value);

        if (q.Status.HasValue)
            query = query.Where(t => t.Status == q.Status.Value);

        if (q.Priority.HasValue)
            query = query.Where(t => t.Priority == q.Priority.Value);

        if (q.Type.HasValue)
            query = query.Where(t => t.Type == q.Type.Value);

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var term = q.Search.Trim().ToLower();
            query = query.Where(t =>
                t.TicketNumber.ToLower().Contains(term) ||
                t.Subject.ToLower().Contains(term) ||
                t.Customer!.FullName.ToLower().Contains(term) ||
                t.Customer!.Phone.Contains(term));
        }

        var total = await query.CountAsync();

        query = q.SortBy?.ToLower() switch
        {
            "ticketnumber"   => q.SortDesc ? query.OrderByDescending(t => t.TicketNumber) : query.OrderBy(t => t.TicketNumber),
            "customername"   => q.SortDesc ? query.OrderByDescending(t => t.Customer!.FullName) : query.OrderBy(t => t.Customer!.FullName),
            "subject"        => q.SortDesc ? query.OrderByDescending(t => t.Subject)   : query.OrderBy(t => t.Subject),
            "type"           => q.SortDesc ? query.OrderByDescending(t => t.Type)      : query.OrderBy(t => t.Type),
            "status"         => q.SortDesc ? query.OrderByDescending(t => t.Status)    : query.OrderBy(t => t.Status),
            "priority"       => q.SortDesc ? query.OrderByDescending(t => t.Priority)  : query.OrderBy(t => t.Priority),
            "lastactionat"   => q.SortDesc ? query.OrderByDescending(t => t.LastActionAt) : query.OrderBy(t => t.LastActionAt),
            _                => q.SortDesc ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
        };

        var items = await query
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .ToListAsync();

        return new PagedResult<SupportTicket>
        {
            Items = items,
            TotalCount = total,
            Page = q.Page,
            PageSize = q.PageSize,
        };
    }

    // ── Stats ────────────────────────────────────────────────────────────────
    public async Task<(int Open, int InProgress, int WaitingClient, int Escalated, int Resolved, int Closed, int Total)> GetCountsAsync()
    {
        var tickets = db.SupportTickets.AsNoTracking();
        return (
            Open          : await tickets.CountAsync(t => t.Status == TicketStatus.Open),
            InProgress    : await tickets.CountAsync(t => t.Status == TicketStatus.InProgress),
            WaitingClient : await tickets.CountAsync(t => t.Status == TicketStatus.WaitingClient),
            Escalated     : await tickets.CountAsync(t => t.Status == TicketStatus.Escalated),
            Resolved      : await tickets.CountAsync(t => t.Status == TicketStatus.Resolved),
            Closed        : await tickets.CountAsync(t => t.Status == TicketStatus.Closed),
            Total         : await tickets.CountAsync()
        );
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────
    public async Task<SupportTicket?> GetByIdAsync(Guid id)
        => await db.SupportTickets
            .Include(t => t.Customer)
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task AddAsync(SupportTicket ticket)
    {
        db.SupportTickets.Add(ticket);
        await db.SaveChangesAsync();
    }

    public async Task UpdateAsync(SupportTicket ticket)
    {
        db.SupportTickets.Update(ticket);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(SupportTicket ticket)
    {
        db.SupportTickets.Remove(ticket);
        await db.SaveChangesAsync();
    }
}

using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.CRM.Domain;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.CRM.Infrastructure;

public class CustomerInteractionRepository(AppDbContext db)
{
    // ── Get all interactions for a customer ──────────────────────────────────
    public async Task<IReadOnlyList<CustomerInteraction>> GetByCustomerIdAsync(Guid customerId)
        => await db.CustomerInteractions
            .Where(i => i.CustomerId == customerId)
            .OrderByDescending(i => i.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

    // ── Add a new interaction ────────────────────────────────────────────────
    public async Task<CustomerInteraction> AddAsync(CustomerInteraction interaction)
    {
        db.CustomerInteractions.Add(interaction);
        await db.SaveChangesAsync();
        return interaction;
    }
}

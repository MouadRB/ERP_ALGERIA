using engine_b.Common.Outbox;
using engine_b.Modules.CRM.Application.Dtos;
using engine_b.Modules.CRM.Domain;
using engine_b.Modules.CRM.Infrastructure;

namespace engine_b.Modules.CRM.Application;

public class CustomerInteractionService(
    CustomerInteractionRepository repo,
    CustomerRepository customerRepo,
    IOutboxPublisher outbox)
{
    // ── Get all interactions for a customer ──────────────────────────────────
    public async Task<IReadOnlyList<CustomerInteractionDto>> GetByCustomerIdAsync(Guid customerId)
    {
        var interactions = await repo.GetByCustomerIdAsync(customerId);
        return interactions.Select(CustomerInteractionDto.FromEntity).ToList();
    }

    // ── Add interaction / note ───────────────────────────────────────────────
    public async Task<CustomerInteractionDto?> AddInteractionAsync(Guid customerId, CreateInteractionRequest request, string agentName)
    {
        var customer = await customerRepo.GetByIdAsync(customerId);
        if (customer is null) return null;

        var interaction = new CustomerInteraction
        {
            CustomerId = customerId,
            Content    = request.Content,
            Type       = Enum.TryParse<InteractionType>(request.Type, true, out var t) ? t : InteractionType.Note,
            CreatedBy  = request.CreatedBy ?? agentName,
        };

        var saved = await repo.AddAsync(interaction);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("interaction.created", "CustomerInteraction", saved.Id.ToString(), new
        {
            interactionId = saved.Id,
            customerId,
            customerName = customer.FullName,
            type = saved.Type.ToString(),
            content = saved.Content,
            createdBy = saved.CreatedBy,
            createdAt = saved.CreatedAt,
        });

        return CustomerInteractionDto.FromEntity(saved);
    }
}

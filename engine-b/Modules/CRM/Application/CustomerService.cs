using engine_b.Common.Outbox;
using engine_b.Modules.CRM.Application.Dtos;
using engine_b.Modules.CRM.Domain;
using engine_b.Modules.CRM.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.CRM.Application;

public class CustomerService(CustomerRepository repo, IOutboxPublisher outbox)
{
    // ── Paged list ───────────────────────────────────────────────────────────
    public async Task<PagedResult<CustomerDto>> GetCustomersAsync(CustomerQueryParams query)
    {
        var result = await repo.GetPagedAsync(query);
        return new PagedResult<CustomerDto>
        {
            Items = result.Items.Select(CustomerDto.FromEntity).ToList(),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize,
        };
    }

    // ── Single customer ──────────────────────────────────────────────────────
    public async Task<CustomerDto?> GetCustomerByIdAsync(Guid id)
    {
        var customer = await repo.GetByIdAsync(id);
        return customer is null ? null : CustomerDto.FromEntity(customer);
    }

    // ── Customer detail (full profile for the detail view) ───────────────────
    public async Task<CustomerDetailDto?> GetCustomerDetailAsync(Guid id)
    {
        var customer = await repo.GetByIdWithDetailsAsync(id);
        if (customer is null) return null;

        var openTicketCount = customer.Tickets
            .Count(t => t.Status != TicketStatus.Closed && t.Status != TicketStatus.Resolved);

        return new CustomerDetailDto
        {
            Id               = customer.Id,
            FullName         = customer.FullName,
            Phone            = customer.Phone,
            Email            = customer.Email,
            SecondaryPhone   = customer.SecondaryPhone,
            PreferredChannel = customer.PreferredChannel,
            PreferredLanguage= customer.PreferredLanguage,
            DeliveryAddress  = customer.DeliveryAddress,
            Wilaya           = customer.Wilaya,
            City             = customer.City,
            TotalOrders      = customer.TotalOrders,
            TotalRevenue     = customer.TotalRevenue,
            ReturnRate       = customer.ReturnRate,
            Segment          = customer.Segment.ToString(),
            RiskLevel        = customer.RiskLevel.ToString(),
            RiskScore        = customer.RiskScore,
            IsBlacklisted    = customer.IsBlacklisted,
            BlacklistReason  = customer.BlacklistReason,
            BlacklistedAt    = customer.BlacklistedAt,
            BlacklistedBy    = customer.BlacklistedBy,
            CreatedAt        = customer.CreatedAt,
            LastOrderDate    = customer.LastOrderDate,
            IsVip            = customer.IsVip,
            TicketCount      = customer.Tickets.Count,
            OpenTicketCount  = openTicketCount,
            InteractionCount = customer.Interactions.Count,
        };
    }

    // ── Order History ──────────────────────────────────────────────────────────
    public async Task<List<engine_b.Modules.Dashboard.Domain.Order>?> GetCustomerOrdersAsync(Guid id)
    {
        var customer = await repo.GetByIdAsync(id);
        if (customer is null) return null;

        return await repo.GetOrdersByPhoneAsync(customer.Phone);
    }

    // ── Create ───────────────────────────────────────────────────────────────
    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request)
    {
        var customer = new Customer
        {
            FullName = request.FullName,
            Phone    = request.Phone,
            Wilaya   = request.Wilaya,
            City     = request.City,
            Email    = request.Email,
        };
        await repo.AddAsync(customer);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("customer.created", "Customer", customer.Id.ToString(), new
        {
            customerId = customer.Id,
            fullName = customer.FullName,
            phone = customer.Phone,
            email = customer.Email,
            wilaya = customer.Wilaya,
            city = customer.City,
            createdAt = customer.CreatedAt,
        });

        return CustomerDto.FromEntity(customer);
    }

    // ── Update ───────────────────────────────────────────────────────────────
    public async Task<CustomerDto?> UpdateCustomerAsync(Guid id, UpdateCustomerRequest request)
    {
        var customer = await repo.GetByIdAsync(id);
        if (customer is null) return null;

        if (request.FullName is not null) customer.FullName = request.FullName;
        if (request.Phone    is not null) customer.Phone    = request.Phone;
        if (request.Wilaya.HasValue)      customer.Wilaya   = request.Wilaya.Value;
        if (request.City is not null) customer.City = request.City;
        if (request.Email is not null) customer.Email = request.Email;
        if (request.SecondaryPhone != null) customer.SecondaryPhone = request.SecondaryPhone;
        if (request.PreferredChannel != null) customer.PreferredChannel = request.PreferredChannel;
        if (request.PreferredLanguage != null) customer.PreferredLanguage = request.PreferredLanguage;
        if (request.DeliveryAddress != null) customer.DeliveryAddress = request.DeliveryAddress;

        await repo.UpdateAsync(customer);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("customer.updated", "Customer", customer.Id.ToString(), new
        {
            customerId = customer.Id,
            fullName = customer.FullName,
            phone = customer.Phone,
            email = customer.Email,
            wilaya = customer.Wilaya,
            city = customer.City,
            segment = customer.Segment.ToString(),
        });

        return CustomerDto.FromEntity(customer);
    }

    // ── Delete ───────────────────────────────────────────────────────────────
    public async Task<bool> DeleteCustomerAsync(Guid id)
    {
        var customer = await repo.GetByIdAsync(id);
        if (customer is null) return false;

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("customer.deleted", "Customer", customer.Id.ToString(), new
        {
            customerId = customer.Id,
            fullName = customer.FullName,
            phone = customer.Phone,
            deletedAt = DateTime.UtcNow,
        });

        await repo.DeleteAsync(customer);
        return true;
    }

    // ── Stats (KPI cards) ────────────────────────────────────────────────────
    public Task<CustomerStatsDto> GetStatsAsync() => repo.GetStatsAsync();

    // ── Segments & Analytics tab payload ─────────────────────────────────────
    public Task<CrmAnalyticsDto> GetAnalyticsAsync() => repo.GetAnalyticsAsync();

    // ── Filter metadata for CRM list UI ──────────────────────────────────────
    public Task<CrmFilterMetadataDto> GetFilterMetadataAsync() => repo.GetFilterMetadataAsync();

    // ── Blacklist ────────────────────────────────────────────────────────────
    public async Task<bool> BlacklistAsync(Guid id, string reason, string? notes, string addedBy)
    {
        var customer = await repo.GetByIdAsync(id);
        if (customer is null) return false;
        customer.IsBlacklisted = true;
        customer.BlacklistReason = reason;
        customer.BlacklistNotes = notes;
        customer.BlacklistedBy = addedBy;
        customer.BlacklistedAt = DateTime.UtcNow;
        await repo.UpdateAsync(customer);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("customer.blacklisted", "Customer", customer.Id.ToString(), new
        {
            customerId = customer.Id,
            fullName = customer.FullName,
            phone = customer.Phone,
            reason,
            addedBy,
            blacklistedAt = customer.BlacklistedAt,
        });

        return true;
    }

    public async Task<bool> UnblacklistAsync(Guid id)
    {
        var customer = await repo.GetByIdAsync(id);
        if (customer is null) return false;
        customer.IsBlacklisted = false;
        customer.BlacklistReason = null;
        await repo.UpdateAsync(customer);

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("customer.unblacklisted", "Customer", customer.Id.ToString(), new
        {
            customerId = customer.Id,
            fullName = customer.FullName,
            phone = customer.Phone,
            unblacklistedAt = DateTime.UtcNow,
        });

        return true;
    }

    // ── Phone lookup (incoming call) ─────────────────────────────────────────
    public async Task<CustomerDto?> LookupByPhoneAsync(string phone)
    {
        var customer = await repo.LookupByPhoneAsync(phone);
        return customer is null ? null : CustomerDto.FromEntity(customer);
    }
    // ── Merge ────────────────────────────────────────────────────────────────
    public async Task<bool> MergeAsync(Guid sourceId, Guid targetId, engine_b.Common.Infrastructure.Data.AppDbContext db)
    {
        if (sourceId == targetId) return false;

        var source = await repo.GetByIdWithDetailsAsync(sourceId);
        var target = await repo.GetByIdAsync(targetId);
        if (source is null || target is null) return false;

        // Transfer Tickets
        var tickets = await db.SupportTickets.Where(t => t.CustomerId == sourceId).ToListAsync();
        foreach (var ticket in tickets)
        {
            ticket.CustomerId = targetId;
        }

        // Transfer Interactions
        var interactions = await db.CustomerInteractions.Where(i => i.CustomerId == sourceId).ToListAsync();
        foreach (var i in interactions)
        {
            i.CustomerId = targetId;
        }
        
        // Sum Orders & Revenue
        target.TotalOrders += source.TotalOrders;
        target.TotalRevenue += source.TotalRevenue;
        if (source.LastOrderDate > target.LastOrderDate || target.LastOrderDate == null)
            target.LastOrderDate = source.LastOrderDate;

        // Save
        db.Customers.Remove(source);
        await db.SaveChangesAsync();

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("customer.merged", "Customer", targetId.ToString(), new
        {
            sourceCustomerId = sourceId,
            targetCustomerId = targetId,
            targetFullName = target.FullName,
            mergedTotalOrders = target.TotalOrders,
            mergedTotalRevenue = target.TotalRevenue,
            mergedAt = DateTime.UtcNow,
        });

        return true;
    }
}

using engine_b.Common.Outbox;
using engine_b.Modules.Finance.Application.Dtos;
using engine_b.Modules.Finance.Domain;
using engine_b.Modules.Finance.Infrastructure;
using engine_b.Modules.Procurement.Application.Dtos;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Finance.Application;

public class InvoiceService(FinanceRepository repo, IOutboxPublisher outbox)
{
    // ── Paged list ───────────────────────────────────────────────────────────
    public async Task<PagedResult<InvoiceDto>> GetInvoicesAsync(InvoiceQueryParams query)
    {
        var q = repo.InvoicesQuery();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim().ToLower();
            q = q.Where(i => i.InvoiceNumber.ToLower().Contains(s)
                          || i.CustomerName.ToLower().Contains(s)
                          || i.OrderNumber.ToLower().Contains(s));
        }
        if (query.Status.HasValue) q = q.Where(i => i.Status == query.Status.Value);
        if (query.Wilaya.HasValue) q = q.Where(i => i.Wilaya == query.Wilaya.Value);
        if (query.From.HasValue) q = q.Where(i => i.CreatedAt >= query.From.Value);
        if (query.To.HasValue) q = q.Where(i => i.CreatedAt <= query.To.Value);

        q = query.SortBy switch
        {
            "created_asc" => q.OrderBy(i => i.CreatedAt),
            "amount_desc" => q.OrderByDescending(i => i.TotalAmount),
            "amount_asc" => q.OrderBy(i => i.TotalAmount),
            _ => q.OrderByDescending(i => i.CreatedAt),
        };

        var total = await q.CountAsync();
        var items = await q
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return new PagedResult<InvoiceDto>
        {
            Items = items.Select(InvoiceDto.FromEntity).ToList(),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total,
        };
    }

    // ── Single invoice ───────────────────────────────────────────────────────
    public async Task<InvoiceDto?> GetInvoiceByIdAsync(Guid id)
    {
        var invoice = await repo.GetInvoiceByIdAsync(id);
        return invoice is null ? null : InvoiceDto.FromEntity(invoice);
    }

    // ── Create (manual) ─────────────────────────────────────────────────────
    public async Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceRequest request, string actor)
    {
        var seq = await repo.GetInvoiceSequenceAsync();
        var taxAmount = Math.Round(request.Subtotal * request.TaxRate / 100, 2);

        var invoice = new Invoice
        {
            InvoiceNumber = $"FAC-{DateTime.UtcNow:yyyy}-{seq:D4}",
            OrderId = request.OrderId,
            OrderNumber = request.OrderNumber,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            Wilaya = request.Wilaya,
            Subtotal = request.Subtotal,
            TaxRate = request.TaxRate,
            TaxAmount = taxAmount,
            TotalAmount = request.Subtotal + taxAmount,
            Status = InvoiceStatus.Draft,
            Notes = request.Notes,
        };

        await outbox.PublishAsync("invoice.created", "Invoice", invoice.Id.ToString(), new
        {
            invoiceId = invoice.Id,
            invoiceNumber = invoice.InvoiceNumber,
            customerName = invoice.CustomerName,
            totalAmount = invoice.TotalAmount,
            wilaya = invoice.Wilaya,
            createdAt = invoice.CreatedAt,
        });

        await repo.AddInvoiceAsync(invoice);
        return InvoiceDto.FromEntity(invoice);
    }

    // ── Generate from delivered order ────────────────────────────────────────
    public async Task<(bool Success, string Message, InvoiceDto? Invoice)> GenerateFromOrderAsync(
        Guid orderId, string orderNumber, string customerName, string customerPhone,
        int wilaya, decimal amount, string actor)
    {
        // Check if invoice already exists for this order
        var existing = await repo.GetInvoiceByOrderIdAsync(orderId);
        if (existing is not null)
            return (false, "Invoice already exists for this order.", InvoiceDto.FromEntity(existing));

        var seq = await repo.GetInvoiceSequenceAsync();
        var taxRate = 19m;
        var subtotal = Math.Round(amount / (1 + taxRate / 100), 2);
        var taxAmount = amount - subtotal;

        var invoice = new Invoice
        {
            InvoiceNumber = $"FAC-{DateTime.UtcNow:yyyy}-{seq:D4}",
            OrderId = orderId,
            OrderNumber = orderNumber,
            CustomerName = customerName,
            CustomerPhone = customerPhone,
            Wilaya = wilaya,
            Subtotal = subtotal,
            TaxRate = taxRate,
            TaxAmount = taxAmount,
            TotalAmount = amount,
            Status = InvoiceStatus.Issued,
            IssuedAt = DateTime.UtcNow,
            IssuedBy = actor,
        };

        await outbox.PublishAsync("invoice.generated", "Invoice", invoice.Id.ToString(), new
        {
            invoiceId = invoice.Id,
            invoiceNumber = invoice.InvoiceNumber,
            orderId,
            orderNumber,
            totalAmount = invoice.TotalAmount,
            wilaya,
            generatedAt = invoice.CreatedAt,
        });

        await repo.AddInvoiceAsync(invoice);
        return (true, "Invoice generated.", InvoiceDto.FromEntity(invoice));
    }

    // ── Issue (Draft → Issued) ──────────────────────────────────────────────
    public async Task<(bool Success, string Message)> IssueAsync(Guid id, string actor)
    {
        var invoice = await repo.GetInvoiceByIdAsync(id);
        if (invoice is null) return (false, "Invoice not found.");
        if (invoice.Status != InvoiceStatus.Draft) return (false, "Only draft invoices can be issued.");

        invoice.Status = InvoiceStatus.Issued;
        invoice.IssuedAt = DateTime.UtcNow;
        invoice.IssuedBy = actor;

        await outbox.PublishAsync("invoice.issued", "Invoice", invoice.Id.ToString(), new
        {
            invoiceId = invoice.Id,
            invoiceNumber = invoice.InvoiceNumber,
            totalAmount = invoice.TotalAmount,
            issuedBy = actor,
            issuedAt = invoice.IssuedAt,
        });

        await repo.UpdateInvoiceAsync(invoice);
        return (true, "Invoice issued.");
    }

    // ── Mark paid (Issued → Paid) ───────────────────────────────────────────
    public async Task<(bool Success, string Message)> MarkPaidAsync(Guid id, string actor)
    {
        var invoice = await repo.GetInvoiceByIdAsync(id);
        if (invoice is null) return (false, "Invoice not found.");
        if (invoice.Status != InvoiceStatus.Issued) return (false, "Only issued invoices can be marked as paid.");

        invoice.Status = InvoiceStatus.Paid;
        invoice.PaidAt = DateTime.UtcNow;
        invoice.PaidBy = actor;

        await outbox.PublishAsync("invoice.paid", "Invoice", invoice.Id.ToString(), new
        {
            invoiceId = invoice.Id,
            invoiceNumber = invoice.InvoiceNumber,
            totalAmount = invoice.TotalAmount,
            paidBy = actor,
            paidAt = invoice.PaidAt,
        });

        await repo.UpdateInvoiceAsync(invoice);
        return (true, "Invoice marked as paid.");
    }

    // ── Void (any → Voided) ─────────────────────────────────────────────────
    public async Task<(bool Success, string Message)> VoidAsync(Guid id, string reason, string actor)
    {
        var invoice = await repo.GetInvoiceByIdAsync(id);
        if (invoice is null) return (false, "Invoice not found.");
        if (invoice.Status == InvoiceStatus.Voided) return (false, "Invoice is already voided.");

        invoice.Status = InvoiceStatus.Voided;
        invoice.VoidedAt = DateTime.UtcNow;
        invoice.VoidedBy = actor;
        invoice.VoidReason = reason;

        await outbox.PublishAsync("invoice.voided", "Invoice", invoice.Id.ToString(), new
        {
            invoiceId = invoice.Id,
            invoiceNumber = invoice.InvoiceNumber,
            totalAmount = invoice.TotalAmount,
            reason,
            voidedBy = actor,
            voidedAt = invoice.VoidedAt,
        });

        await repo.UpdateInvoiceAsync(invoice);
        return (true, "Invoice voided.");
    }

    // ── Stats ────────────────────────────────────────────────────────────────
    public async Task<InvoiceStatsDto> GetInvoiceStatsAsync()
    {
        var all = await repo.InvoicesQuery().ToListAsync();
        var paid = all.Where(i => i.Status == InvoiceStatus.Paid).Sum(i => i.TotalAmount);
        var outstanding = all.Where(i => i.Status == InvoiceStatus.Issued).Sum(i => i.TotalAmount);

        return new InvoiceStatsDto
        {
            TotalCount = all.Count,
            DraftCount = all.Count(i => i.Status == InvoiceStatus.Draft),
            IssuedCount = all.Count(i => i.Status == InvoiceStatus.Issued),
            PaidCount = all.Count(i => i.Status == InvoiceStatus.Paid),
            VoidedCount = all.Count(i => i.Status == InvoiceStatus.Voided),
            TotalRevenue = all.Where(i => i.Status != InvoiceStatus.Voided).Sum(i => i.TotalAmount),
            PaidRevenue = paid,
            OutstandingRevenue = outstanding,
        };
    }
}

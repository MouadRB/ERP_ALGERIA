using engine_b.Common.Outbox;
using engine_b.Modules.Procurement.Application.Dtos;
using engine_b.Modules.Procurement.Domain;
using engine_b.Modules.Procurement.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Procurement.Application;

public class ProcurementService(ProcurementRepository repository, IOutboxPublisher outbox)
{
    private const string SodRule = "Creator cannot self-approve. Allowed: SuperAdmin / Finance Director.";

    public async Task<ProcurementOverviewDto> GetOverviewAsync()
    {
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var poQuery = repository.PurchaseOrdersQuery();

        return new ProcurementOverviewDto
        {
            TotalPurchaseOrders = await poQuery.CountAsync(),
            PendingApprovalCount = await poQuery.CountAsync(x => x.Status == PurchaseOrderStatus.PendingApproval),
            ActiveSuppliers = (await repository.GetSuppliersAsync()).Count,
            ReceiptsThisMonth = (await repository.GetRecentReceiptsAsync(500)).Count(r => r.ReceivedAt >= monthStart),
            StockAlertsCount = (await repository.GetActiveStockAlertsAsync()).Count,
            MonthlySpend = await poQuery.Where(x => x.CreatedAt >= monthStart).SumAsync(x => x.TotalAmount)
        };
    }

    public async Task<PagedResult<PurchaseOrderListItemDto>> GetPurchaseOrdersAsync(PurchaseOrderQueryParams query)
    {
        var poQuery = repository.PurchaseOrdersQuery();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim().ToLower();
            poQuery = poQuery.Where(x => x.Reference.ToLower().Contains(s) || x.Supplier!.Name.ToLower().Contains(s));
        }
        if (query.Status.HasValue) poQuery = poQuery.Where(x => x.Status == query.Status.Value);
        if (query.Priority.HasValue) poQuery = poQuery.Where(x => x.Priority == query.Priority.Value);
        if (query.SupplierId.HasValue) poQuery = poQuery.Where(x => x.SupplierId == query.SupplierId.Value);

        poQuery = query.SortBy switch
        {
            "created_asc" => poQuery.OrderBy(x => x.CreatedAt),
            "amount_desc" => poQuery.OrderByDescending(x => x.TotalAmount),
            "amount_asc" => poQuery.OrderBy(x => x.TotalAmount),
            _ => poQuery.OrderByDescending(x => x.CreatedAt),
        };

        var total = await poQuery.CountAsync();
        var items = await poQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new PurchaseOrderListItemDto
            {
                Id = x.Id,
                Reference = x.Reference,
                SupplierName = x.Supplier!.Name,
                ArticlesCount = x.Lines.Count,
                Amount = x.TotalAmount,
                Status = x.Status,
                Priority = x.Priority,
                Sod = x.SodRule,
                EtaDate = x.EtaDate,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<PurchaseOrderListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<PurchaseOrderDetailDto?> GetPurchaseOrderByIdAsync(Guid id)
    {
        var po = await repository.GetPurchaseOrderAsync(id);
        if (po is null) return null;

        return new PurchaseOrderDetailDto
        {
            Id = po.Id,
            Reference = po.Reference,
            Status = po.Status,
            Priority = po.Priority,
            SupplierName = po.Supplier?.Name ?? string.Empty,
            Warehouse = po.Warehouse,
            Subtotal = po.Subtotal,
            TransportCost = po.TransportCost,
            CustomsCost = po.CustomsCost,
            TotalAmount = po.TotalAmount,
            BudgetAvailable = po.BudgetAvailable,
            CreatedAt = po.CreatedAt,
            EtaDate = po.EtaDate,
            CreatedBy = po.CreatedBy,
            ApprovedBy = po.ApprovedBy,
            Lines = po.Lines.Select(l => new PurchaseOrderLineDto
            {
                Id = l.Id,
                Sku = l.Sku,
                ProductName = l.ProductName,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                Subtotal = l.Subtotal,
                ReceivedQuantity = l.ReceivedQuantity
            }).ToList()
        };
    }

    public async Task<PurchaseOrderDetailDto> CreatePurchaseOrderAsync(CreatePurchaseOrderRequest request, string actor)
    {
        var supplier = await repository.GetSupplierAsync(request.SupplierId) ??
                       throw new InvalidOperationException("Supplier not found.");

        var lines = request.Lines.Select(x => new PurchaseOrderLine
        {
            Sku = x.Sku,
            ProductName = x.ProductName,
            Quantity = x.Quantity,
            UnitPrice = x.UnitPrice,
            Subtotal = x.Quantity * x.UnitPrice
        }).ToList();

        var subtotal = lines.Sum(x => x.Subtotal);
        var po = new PurchaseOrder
        {
            Reference = $"BC-{DateTime.UtcNow:yyMMdd}-{Random.Shared.Next(100, 999)}",
            SupplierId = supplier.Id,
            Priority = request.Priority,
            Status = PurchaseOrderStatus.PendingApproval,
            CreatedBy = actor,
            Warehouse = request.Warehouse,
            BudgetAvailable = request.BudgetAvailable,
            TransportCost = request.TransportCost,
            CustomsCost = request.CustomsCost,
            Subtotal = subtotal,
            TotalAmount = subtotal + request.TransportCost + request.CustomsCost,
            Notes = request.Notes,
            EtaDate = DateTime.UtcNow.AddDays(supplier.LeadTimeDays),
            Lines = lines,
            SodRule = SodRule
        };

        await repository.AddPurchaseOrderAsync(po);
        await repository.AddAuditEventAsync(new PurchaseOrderAuditEvent
        {
            PurchaseOrderId = po.Id,
            EventType = "created",
            Message = $"Purchase order {po.Reference} created and submitted for approval.",
            Actor = actor
        });

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("purchase_order.created", "PurchaseOrder", po.Id.ToString(), new
        {
            purchaseOrderId = po.Id,
            reference = po.Reference,
            supplierId = po.SupplierId,
            totalAmount = po.TotalAmount,
            priority = po.Priority.ToString(),
            createdBy = actor,
            createdAt = po.CreatedAt,
        });

        return (await GetPurchaseOrderByIdAsync(po.Id))!;
    }

    public async Task<bool> UpdateStatusAsync(Guid id, PurchaseOrderStatus status, string actor)
    {
        var po = await repository.GetPurchaseOrderAsync(id);
        if (po is null) return false;

        po.Status = status;
        if (status == PurchaseOrderStatus.Approved)
        {
            po.ApprovedBy = actor;
            po.ApprovedAt = DateTime.UtcNow;
        }
        if (status == PurchaseOrderStatus.SentToSupplier) po.SentAt = DateTime.UtcNow;
        if (status == PurchaseOrderStatus.Received) po.ReceivedAt = DateTime.UtcNow;

        await repository.UpdatePurchaseOrderAsync(po);
        await repository.AddAuditEventAsync(new PurchaseOrderAuditEvent
        {
            PurchaseOrderId = po.Id,
            EventType = "status_changed",
            Message = $"Status changed to {status}.",
            Actor = actor
        });
        return true;
    }

    public async Task<(bool Success, string Message)> ApproveAsync(Guid id, string actor, bool isPrivilegedApprover)
    {
        var po = await repository.GetPurchaseOrderAsync(id);
        if (po is null) return (false, "Purchase order not found.");
        if (po.Status is PurchaseOrderStatus.Cancelled or PurchaseOrderStatus.Received) return (false, "Purchase order is closed.");
        if (po.Status != PurchaseOrderStatus.PendingApproval) return (false, "Purchase order is not pending approval.");

        var sameActor = string.Equals(po.CreatedBy.Trim(), actor.Trim(), StringComparison.OrdinalIgnoreCase);
        if (sameActor && !isPrivilegedApprover)
            return (false, "SoD violation: creator cannot self-approve.");

        po.Status = PurchaseOrderStatus.Approved;
        po.ApprovedBy = actor;
        po.ApprovedAt = DateTime.UtcNow;
        await repository.UpdatePurchaseOrderAsync(po);
        await repository.AddAuditEventAsync(new PurchaseOrderAuditEvent
        {
            PurchaseOrderId = po.Id,
            EventType = "approved",
            Message = $"{po.Reference} approved.",
            Actor = actor
        });

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("purchase_order.approved", "PurchaseOrder", po.Id.ToString(), new
        {
            purchaseOrderId = po.Id,
            reference = po.Reference,
            approvedBy = actor,
            approvedAt = po.ApprovedAt,
            totalAmount = po.TotalAmount,
        });

        return (true, "Purchase order approved.");
    }

    public async Task<(bool Success, string Message)> SendToSupplierAsync(Guid id, string actor)
    {
        var po = await repository.GetPurchaseOrderAsync(id);
        if (po is null) return (false, "Purchase order not found.");
        if (po.Status != PurchaseOrderStatus.Approved) return (false, "Only approved purchase orders can be sent.");

        po.Status = PurchaseOrderStatus.SentToSupplier;
        po.SentAt = DateTime.UtcNow;
        await repository.UpdatePurchaseOrderAsync(po);
        await repository.AddAuditEventAsync(new PurchaseOrderAuditEvent
        {
            PurchaseOrderId = po.Id,
            EventType = "sent",
            Message = $"{po.Reference} sent to supplier.",
            Actor = actor
        });

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("purchase_order.sent", "PurchaseOrder", po.Id.ToString(), new
        {
            purchaseOrderId = po.Id,
            reference = po.Reference,
            sentBy = actor,
            sentAt = po.SentAt,
        });

        return (true, "Purchase order sent to supplier.");
    }

    public async Task<(bool Success, string Message)> CancelAsync(Guid id, string actor)
    {
        var po = await repository.GetPurchaseOrderAsync(id);
        if (po is null) return (false, "Purchase order not found.");
        if (po.Status == PurchaseOrderStatus.Received) return (false, "Cannot cancel a fully received purchase order.");
        if (po.Status == PurchaseOrderStatus.Cancelled) return (true, "Purchase order already cancelled.");

        po.Status = PurchaseOrderStatus.Cancelled;
        await repository.UpdatePurchaseOrderAsync(po);
        await repository.AddAuditEventAsync(new PurchaseOrderAuditEvent
        {
            PurchaseOrderId = po.Id,
            EventType = "cancelled",
            Message = $"{po.Reference} cancelled.",
            Actor = actor
        });

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("purchase_order.cancelled", "PurchaseOrder", po.Id.ToString(), new
        {
            purchaseOrderId = po.Id,
            reference = po.Reference,
            cancelledBy = actor,
            cancelledAt = DateTime.UtcNow,
        });

        return (true, "Purchase order cancelled.");
    }

    public async Task<(bool Success, string Message)> ReceiveAsync(Guid id, ReceivePurchaseOrderRequest request, string actor)
    {
        var po = await repository.GetPurchaseOrderAsync(id);
        if (po is null) return (false, "Purchase order not found.");
        if (po.Status is PurchaseOrderStatus.Cancelled or PurchaseOrderStatus.Draft) return (false, "Cannot receive this purchase order.");

        if (request.Lines.Count == 0)
            return (false, "At least one line receipt is required.");

        foreach (var lineReq in request.Lines)
        {
            var line = po.Lines.FirstOrDefault(x => x.Id == lineReq.PurchaseOrderLineId);
            if (line is null) return (false, $"Line {lineReq.PurchaseOrderLineId} not found.");
            if (lineReq.ReceivedQuantity < 0) return (false, "Received quantity cannot be negative.");
            var nextQty = line.ReceivedQuantity + lineReq.ReceivedQuantity;
            if (nextQty > line.Quantity) return (false, $"Received quantity exceeds ordered quantity for SKU {line.Sku}.");
            line.ReceivedQuantity = nextQty;
        }

        var fullyReceived = po.Lines.All(x => x.ReceivedQuantity >= x.Quantity);
        po.Status = fullyReceived ? PurchaseOrderStatus.Received : PurchaseOrderStatus.PartiallyReceived;
        if (fullyReceived) po.ReceivedAt = DateTime.UtcNow;

        var receipt = new ProcurementReceipt
        {
            PurchaseOrderId = po.Id,
            ReceiptNumber = string.IsNullOrWhiteSpace(request.ReceiptNumber) ? $"REC-{po.Reference}-{DateTime.UtcNow:HHmmss}" : request.ReceiptNumber.Trim(),
            UnitsReceived = request.Lines.Sum(x => x.ReceivedQuantity),
            TotalReceivedValue = po.Lines.Sum(x => x.ReceivedQuantity * x.UnitPrice),
            ReceivedBy = string.IsNullOrWhiteSpace(request.ReceivedBy) ? actor : request.ReceivedBy.Trim(),
            ReceivedAt = DateTime.UtcNow
        };

        await repository.UpdatePurchaseOrderAsync(po);
        await repository.AddReceiptAsync(receipt);
        await repository.AddAuditEventAsync(new PurchaseOrderAuditEvent
        {
            PurchaseOrderId = po.Id,
            EventType = "receipt_logged",
            Message = $"{receipt.ReceiptNumber} logged with {receipt.UnitsReceived} units.",
            Actor = actor
        });

        // ── Outbox: notify external engines ──
        await outbox.PublishAsync("purchase_order.received", "PurchaseOrder", po.Id.ToString(), new
        {
            purchaseOrderId = po.Id,
            reference = po.Reference,
            receiptNumber = receipt.ReceiptNumber,
            unitsReceived = receipt.UnitsReceived,
            totalReceivedValue = receipt.TotalReceivedValue,
            fullyReceived,
            receivedBy = actor,
            receivedAt = receipt.ReceivedAt,
        });

        return (true, fullyReceived ? "Purchase order fully received." : "Partial receipt logged.");
    }

    public async Task<List<PurchaseOrderAuditEventDto>> GetAuditTimelineAsync(Guid purchaseOrderId)
        => (await repository.GetAuditEventsAsync(purchaseOrderId))
            .Select(x => new PurchaseOrderAuditEventDto
            {
                Id = x.Id,
                EventType = x.EventType,
                Message = x.Message,
                Actor = x.Actor,
                CreatedAt = x.CreatedAt
            })
            .ToList();

    public async Task<ProcurementAnalyticsDto> GetAnalyticsAsync()
    {
        var query = repository.PurchaseOrdersQuery();
        var all = await query.ToListAsync();
        var receivedWithLead = all
            .Where(x => x.Status == PurchaseOrderStatus.Received && x.ReceivedAt.HasValue)
            .Select(x => (x.ReceivedAt!.Value - x.CreatedAt).TotalDays)
            .ToList();

        var supplierPerf = all
            .GroupBy(x => new { x.SupplierId, Name = x.Supplier!.Name, x.Supplier.OnTimeRate, x.Supplier.ReliabilityScore })
            .Select(g => new SupplierPerformanceDto
            {
                SupplierId = g.Key.SupplierId,
                SupplierName = g.Key.Name,
                TotalSpend = g.Sum(x => x.TotalAmount),
                OrdersCount = g.Count(),
                OnTimeRate = g.Key.OnTimeRate,
                ReliabilityScore = g.Key.ReliabilityScore
            })
            .OrderByDescending(x => x.TotalSpend)
            .ToList();

        return new ProcurementAnalyticsDto
        {
            DraftCount = all.Count(x => x.Status == PurchaseOrderStatus.Draft),
            PendingApprovalCount = all.Count(x => x.Status == PurchaseOrderStatus.PendingApproval),
            ApprovedCount = all.Count(x => x.Status == PurchaseOrderStatus.Approved),
            SentCount = all.Count(x => x.Status == PurchaseOrderStatus.SentToSupplier || x.Status == PurchaseOrderStatus.PartiallyReceived),
            ReceivedCount = all.Count(x => x.Status == PurchaseOrderStatus.Received),
            AverageLeadTimeDays = receivedWithLead.Count == 0 ? 0 : Math.Round((decimal)receivedWithLead.Average(), 1),
            SupplierPerformance = supplierPerf
        };
    }

    public async Task<BatchActionResultDto> ApproveAllPendingAsync(string actor, bool isPrivilegedApprover)
    {
        var pending = await repository.PurchaseOrdersQuery()
            .Where(x => x.Status == PurchaseOrderStatus.PendingApproval)
            .ToListAsync();

        var result = new BatchActionResultDto { ProcessedCount = pending.Count };
        foreach (var po in pending)
        {
            var action = await ApproveAsync(po.Id, actor, isPrivilegedApprover);
            if (action.Success) result.SucceededCount++;
            else result.Errors.Add($"{po.Reference}: {action.Message}");
        }

        return result;
    }

    public async Task<(bool Success, string Message, PurchaseOrderDetailDto? PurchaseOrder)> CreateGroupedFromAlertsAsync(
        CreateGroupedPurchaseOrderFromAlertsRequest request,
        string actor)
    {
        var supplier = await repository.GetSupplierAsync(request.SupplierId);
        if (supplier is null) return (false, "Supplier not found.", null);
        if (request.DefaultUnitPrice <= 0) return (false, "Default unit price must be greater than zero.", null);

        var alerts = await repository.GetActiveStockAlertsAsync();
        var selected = request.OnlyUrgent
            ? alerts.Where(x => x.Severity == AlertSeverity.Critical).ToList()
            : alerts;

        if (selected.Count == 0)
            return (false, "No matching stock alerts found to create a grouped purchase order.", null);

        var lines = selected.Select(a => new CreatePurchaseOrderLineRequest
        {
            Sku = a.Sku,
            ProductName = a.ProductName,
            Quantity = Math.Max(a.SuggestedOrderQty, 1),
            UnitPrice = request.DefaultUnitPrice
        }).ToList();

        var create = new CreatePurchaseOrderRequest
        {
            SupplierId = request.SupplierId,
            Priority = request.Priority,
            Warehouse = request.Warehouse,
            BudgetAvailable = request.BudgetAvailable,
            TransportCost = 0,
            CustomsCost = 0,
            Notes = $"Grouped BC generated from {selected.Count} stock alert(s).",
            Lines = lines
        };

        var po = await CreatePurchaseOrderAsync(create, actor);
        await repository.AddAuditEventAsync(new PurchaseOrderAuditEvent
        {
            PurchaseOrderId = po.Id,
            EventType = "grouped_from_alerts",
            Message = $"Created from {selected.Count} stock alerts.",
            Actor = actor
        });

        return (true, "Grouped purchase order created.", po);
    }

    public Task<List<Supplier>> GetSuppliersAsync() => repository.GetSuppliersAsync();
    public Task<List<ProcurementStockAlert>> GetStockAlertsAsync() => repository.GetActiveStockAlertsAsync();
    public Task<List<ProcurementReceipt>> GetReceiptsAsync() => repository.GetRecentReceiptsAsync();
}

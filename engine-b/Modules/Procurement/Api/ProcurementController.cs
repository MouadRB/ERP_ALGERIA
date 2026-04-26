using engine_b.Modules.Procurement.Application;
using engine_b.Modules.Procurement.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace engine_b.Modules.Procurement.Api;

[ApiController]
[Route("api/procurement")]
[Authorize(Policy = "ProcurementRead")]
public class ProcurementController(ProcurementService service) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
        => Ok(await service.GetOverviewAsync());

    [HttpGet("purchase-orders")]
    public async Task<IActionResult> GetPurchaseOrders([FromQuery] PurchaseOrderQueryParams query)
        => Ok(await service.GetPurchaseOrdersAsync(query));

    [HttpGet("purchase-orders/{id:guid}")]
    public async Task<IActionResult> GetPurchaseOrder(Guid id)
    {
        var po = await service.GetPurchaseOrderByIdAsync(id);
        return po is null ? NotFound() : Ok(po);
    }

    [HttpPost("purchase-orders")]
    [Authorize(Policy = "ProcurementWrite")]
    public async Task<IActionResult> CreatePurchaseOrder([FromBody] CreatePurchaseOrderRequest request)
    {
        var actor = User.Identity?.Name ?? "Procurement Manager";
        var po = await service.CreatePurchaseOrderAsync(request, actor);
        return CreatedAtAction(nameof(GetPurchaseOrder), new { id = po.Id }, po);
    }

    [HttpPut("purchase-orders/{id:guid}/status")]
    [Authorize(Policy = "ProcurementWrite")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdatePurchaseOrderStatusRequest request)
    {
        var actor = User.Identity?.Name ?? "SuperAdmin";
        var updated = await service.UpdateStatusAsync(id, request.Status, actor);
        return updated ? Ok() : NotFound();
    }

    [HttpPost("purchase-orders/{id:guid}/approve")]
    [Authorize(Policy = "ProcurementWrite")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var actor = User.Identity?.Name ?? "Unknown";
        var privileged = User.IsInRole("SuperAdmin") || User.IsInRole("FinanceDirector") || User.IsInRole("Finance Director");
        var result = await service.ApproveAsync(id, actor, privileged);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    [HttpPost("purchase-orders/approve-all")]
    [Authorize(Policy = "ProcurementWrite")]
    public async Task<IActionResult> ApproveAll()
    {
        var actor = User.Identity?.Name ?? "Unknown";
        var privileged = User.IsInRole("SuperAdmin") || User.IsInRole("FinanceDirector") || User.IsInRole("Finance Director");
        var result = await service.ApproveAllPendingAsync(actor, privileged);
        return Ok(result);
    }

    [HttpPost("purchase-orders/{id:guid}/send")]
    [Authorize(Policy = "ProcurementWrite")]
    public async Task<IActionResult> SendToSupplier(Guid id)
    {
        var actor = User.Identity?.Name ?? "Procurement Manager";
        var result = await service.SendToSupplierAsync(id, actor);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    [HttpPost("purchase-orders/{id:guid}/cancel")]
    [Authorize(Policy = "ProcurementWrite")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var actor = User.Identity?.Name ?? "Procurement Manager";
        var result = await service.CancelAsync(id, actor);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    [HttpPost("purchase-orders/{id:guid}/receive")]
    [Authorize(Policy = "ProcurementWrite")]
    public async Task<IActionResult> Receive(Guid id, [FromBody] ReceivePurchaseOrderRequest request)
    {
        var actor = User.Identity?.Name ?? "Inventory Manager";
        var result = await service.ReceiveAsync(id, request, actor);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    [HttpGet("purchase-orders/{id:guid}/audit")]
    public async Task<IActionResult> GetAuditTimeline(Guid id)
        => Ok(await service.GetAuditTimelineAsync(id));

    [HttpGet("suppliers")]
    public async Task<IActionResult> GetSuppliers()
        => Ok(await service.GetSuppliersAsync());

    [HttpGet("stock-alerts")]
    public async Task<IActionResult> GetStockAlerts()
        => Ok(await service.GetStockAlertsAsync());

    [HttpGet("receipts")]
    public async Task<IActionResult> GetReceipts()
        => Ok(await service.GetReceiptsAsync());

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
        => Ok(await service.GetAnalyticsAsync());

    [HttpPost("purchase-orders/grouped-from-alerts")]
    [Authorize(Policy = "ProcurementWrite")]
    public async Task<IActionResult> CreateGroupedFromAlerts([FromBody] CreateGroupedPurchaseOrderFromAlertsRequest request)
    {
        var actor = User.Identity?.Name ?? "Procurement Manager";
        var result = await service.CreateGroupedFromAlertsAsync(request, actor);
        if (!result.Success) return BadRequest(new { error = result.Message });
        return Ok(new { message = result.Message, purchaseOrder = result.PurchaseOrder });
    }
}

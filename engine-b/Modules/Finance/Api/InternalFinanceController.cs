using engine_b.Modules.Finance.Application;
using engine_b.Modules.Finance.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace engine_b.Modules.Finance.Api;

/// <summary>
/// Internal endpoints for cross-module communication (e.g. from Dashboard/OMS or Procurement).
/// Secured with the "InternalSystem" policy to prevent external access.
/// </summary>
[ApiController]
[Route("internal/finance")]
[Authorize(Policy = "InternalSystem")]
public class InternalFinanceController(
    InvoiceService invoiceService,
    DeferredRevenueService deferredRevenueService) : ControllerBase
{
    /// <summary>
    /// Called by the OMS/Dashboard module when an order is marked as Livree/Remise (delivered/collected).
    /// Auto-generates a financial invoice from the source order.
    /// </summary>
    [HttpPost("invoices/from-order/{orderId:guid}")]
    public async Task<IActionResult> GenerateInvoiceFromOrder(
        Guid orderId,
        [FromQuery] string orderNumber,
        [FromQuery] string customerName,
        [FromQuery] string customerPhone,
        [FromQuery] int wilaya,
        [FromQuery] decimal amount)
    {
        var actor = "System (OMS Auto-Gen)";
        var result = await invoiceService.GenerateFromOrderAsync(
            orderId, orderNumber, customerName, customerPhone, wilaya, amount, actor);

        if (!result.Success) return BadRequest(new { error = result.Message });

        return Ok(new { message = result.Message, invoice = result.Invoice });
    }

    /// <summary>
    /// Called by the Procurement module when a purchase order is received.
    /// Creates a new FIFO cost layer for inventory valuation.
    /// </summary>
    [HttpPost("fifo/from-receipt")]
    public async Task<IActionResult> CreateFifoLayerFromReceipt([FromBody] CreateFifoLayerRequest request)
    {
        var layer = await deferredRevenueService.CreateFifoLayerAsync(request);
        return Ok(new { message = "FIFO layer created", layer });
    }
}

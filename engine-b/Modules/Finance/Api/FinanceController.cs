using engine_b.Modules.Finance.Application;
using engine_b.Modules.Finance.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace engine_b.Modules.Finance.Api;

[ApiController]
[Route("api/finance")]
[Authorize(Policy = "FinanceRead")]
public class FinanceController(
    InvoiceService invoiceService,
    RevenueRecognitionService revenueService,
    DeferredRevenueService deferredRevenueService,
    PeriodLockService periodService) : ControllerBase
{
    // ── Invoices ─────────────────────────────────────────────────────────────

    [HttpGet("invoices")]
    public async Task<IActionResult> GetInvoices([FromQuery] InvoiceQueryParams query)
        => Ok(await invoiceService.GetInvoicesAsync(query));

    [HttpGet("invoices/{id:guid}")]
    public async Task<IActionResult> GetInvoice(Guid id)
    {
        var invoice = await invoiceService.GetInvoiceByIdAsync(id);
        return invoice is null ? NotFound() : Ok(invoice);
    }

    [HttpPost("invoices")]
    [Authorize(Policy = "FinanceWrite")]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceRequest request)
    {
        var actor = User.Identity?.Name ?? "Finance Manager";
        var invoice = await invoiceService.CreateInvoiceAsync(request, actor);
        return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
    }

    [HttpPost("invoices/{id:guid}/issue")]
    [Authorize(Policy = "FinanceWrite")]
    public async Task<IActionResult> IssueInvoice(Guid id)
    {
        var actor = User.Identity?.Name ?? "Finance Manager";
        var result = await invoiceService.IssueAsync(id, actor);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    [HttpPost("invoices/{id:guid}/pay")]
    [Authorize(Policy = "FinanceWrite")]
    public async Task<IActionResult> MarkInvoicePaid(Guid id)
    {
        var actor = User.Identity?.Name ?? "Finance Manager";
        var result = await invoiceService.MarkPaidAsync(id, actor);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    [HttpPost("invoices/{id:guid}/void")]
    [Authorize(Policy = "FinanceWrite")]
    public async Task<IActionResult> VoidInvoice(Guid id, [FromBody] VoidInvoiceRequest request)
    {
        var actor = User.Identity?.Name ?? "Finance Manager";
        var result = await invoiceService.VoidAsync(id, request.Reason, actor);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    // ── Revenue Analytics ────────────────────────────────────────────────────

    [HttpGet("revenue/overview")]
    public async Task<IActionResult> GetRevenueOverview([FromQuery] int periodDays = 30)
        => Ok(await revenueService.GetRevenueOverviewAsync(periodDays));

    [HttpGet("revenue/by-wilaya")]
    public async Task<IActionResult> GetRevenueByWilaya([FromQuery] int periodDays = 30)
        => Ok(await revenueService.GetRevenueByWilayaAsync(periodDays));

    [HttpGet("revenue/timeline")]
    public async Task<IActionResult> GetRevenueTimeline([FromQuery] int periodDays = 30)
        => Ok(await revenueService.GetRevenueTimelineAsync(periodDays));

    [HttpGet("revenue/top-products")]
    public async Task<IActionResult> GetTopProducts([FromQuery] int top = 5, [FromQuery] int periodDays = 30)
        => Ok(await revenueService.GetTopProductsByRevenueAsync(top, periodDays));

    // ── Deferred Revenue & FIFO ──────────────────────────────────────────────

    [HttpGet("deferred-revenue")]
    public async Task<IActionResult> GetDeferredRevenueSummary()
        => Ok(await deferredRevenueService.GetDeferredRevenueSummaryAsync());

    [HttpGet("fifo-valuation")]
    public async Task<IActionResult> GetFifoValuation()
        => Ok(await deferredRevenueService.GetFifoValuationAsync());

    [HttpGet("fifo-layers")]
    public async Task<IActionResult> GetFifoLayers([FromQuery] string? warehouse = null)
        => Ok(await deferredRevenueService.GetFifoLayersByWarehouseAsync(warehouse));

    // ── Accounting Periods ───────────────────────────────────────────────────

    [HttpGet("periods")]
    public async Task<IActionResult> GetPeriods()
        => Ok(await periodService.GetPeriodsAsync());

    [HttpGet("periods/current")]
    public async Task<IActionResult> GetCurrentPeriod()
    {
        var period = await periodService.GetCurrentPeriodAsync();
        return period is null ? NotFound() : Ok(period);
    }

    [HttpPost("periods")]
    [Authorize(Policy = "FinanceWrite")]
    public async Task<IActionResult> CreatePeriod([FromBody] CreatePeriodRequest request)
    {
        var actor = User.Identity?.Name ?? "Finance Director";
        var period = await periodService.CreatePeriodAsync(request, actor);
        return Ok(period);
    }

    [HttpPost("periods/{id:guid}/lock")]
    [Authorize(Policy = "FinanceWrite")]
    public async Task<IActionResult> LockPeriod(Guid id)
    {
        var actor = User.Identity?.Name ?? "Finance Director";
        var result = await periodService.LockPeriodAsync(id, actor);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    [HttpPost("periods/{id:guid}/close")]
    [Authorize(Policy = "FinanceWrite")]
    public async Task<IActionResult> ClosePeriod(Guid id)
    {
        var actor = User.Identity?.Name ?? "Finance Director";
        var result = await periodService.ClosePeriodAsync(id, actor);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    [HttpPost("periods/{id:guid}/reopen")]
    [Authorize(Policy = "FinanceWrite")]
    public async Task<IActionResult> ReopenPeriod(Guid id)
    {
        var actor = User.Identity?.Name ?? "Finance Director";
        var result = await periodService.ReopenPeriodAsync(id, actor);
        return result.Success ? Ok(new { message = result.Message }) : BadRequest(new { error = result.Message });
    }

    // ── Dashboard Overview ───────────────────────────────────────────────────

    [HttpGet("overview")]
    public async Task<IActionResult> GetFinanceOverview()
    {
        var revenue = await revenueService.GetRevenueOverviewAsync();
        var fifo = await deferredRevenueService.GetFifoValuationAsync();
        var invoices = await invoiceService.GetInvoiceStatsAsync();
        var deferred = await deferredRevenueService.GetDeferredRevenueSummaryAsync();

        return Ok(new FinanceOverviewDto
        {
            TotalRevenue = revenue.TotalRevenue,
            RevenueChangePercent = revenue.ChangePercent,
            FifoValuation = fifo.TotalValuation,
            FifoWarehouseCount = fifo.WarehouseCount,
            InvoiceStats = invoices,
            DeferredRevenue = deferred,
        });
    }
}

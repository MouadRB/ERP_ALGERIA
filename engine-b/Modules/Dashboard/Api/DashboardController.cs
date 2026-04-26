using engine_b.Modules.Dashboard.Application;
using engine_b.Modules.Dashboard.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace engine_b.Modules.Dashboard.Api;

[ApiController]
[Route("api/dashboard")]
[Authorize(Policy = "OrdersRead")]
public class DashboardController(DashboardService dashboardService) : ControllerBase
{
    /// <summary>Full dashboard payload (KPIs + queue + funnel + risk).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard()
        => Ok(await dashboardService.GetSummaryAsync());

    /// <summary>KPI summary cards only.</summary>
    [HttpGet("kpis")]
    [ProducesResponseType(typeof(DashboardKpiDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKpis()
        => Ok(await dashboardService.GetKpisAsync());

    /// <summary>Confirmation queue ("File de Confirmation").</summary>
    [HttpGet("confirmation-queue")]
    [ProducesResponseType(typeof(List<ConfirmationQueueItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConfirmationQueue()
        => Ok(await dashboardService.GetConfirmationQueueAsync());

    /// <summary>COD funnel chart data.</summary>
    [HttpGet("cod-funnel")]
    [ProducesResponseType(typeof(CodFunnelDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCodFunnel()
        => Ok(await dashboardService.GetCodFunnelAsync());

    /// <summary>Risk score donut chart data.</summary>
    [HttpGet("risk-score")]
    [ProducesResponseType(typeof(RiskScoreDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRiskScore()
        => Ok(await dashboardService.GetRiskScoreAsync());

    /// <summary>Confirm a single pending order.</summary>
    [HttpPost("orders/{id:guid}/confirm")]
    [Authorize(Policy = "OrdersWrite")]
    public async Task<IActionResult> ConfirmOrder(Guid id)
        => await dashboardService.ConfirmOrderAsync(id)
            ? Ok(new { message = "Order confirmed." })
            : NotFound(new { error = "Order not found or not pending." });

    /// <summary>"Tout confirmer" — batch confirm all pending orders.</summary>
    [HttpPost("orders/confirm-all")]
    [Authorize(Policy = "OrdersWrite")]
    public async Task<IActionResult> ConfirmAll()
    {
        var count = await dashboardService.ConfirmAllPendingAsync();
        return Ok(new { message = $"{count} order(s) confirmed." });
    }
}

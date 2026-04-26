using engine_b.Modules.CRM.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace engine_b.Modules.CRM.Api;

[ApiController]
[Route("internal/crm")]
[Authorize(Policy = "CrmWrite")]
public class InternalCrmController(
    RfmCalculationJob rfmJob,
    FraudScoringService fraudService) : ControllerBase
{
    /// <summary>Trigger RFM segment recalculation for all customers.</summary>
    [HttpPost("rfm/recalculate")]
    public async Task<IActionResult> RecalculateSegments()
    {
        var updated = await rfmJob.RunAsync();
        return Ok(new { message = $"Recalculated segments. {updated} customer(s) updated." });
    }

    /// <summary>Trigger fraud/risk scoring for all customers.</summary>
    [HttpPost("fraud/score")]
    public async Task<IActionResult> ScoreFraud()
    {
        var updated = await fraudService.ScoreAllAsync();
        return Ok(new { message = $"Risk scored. {updated} customer(s) updated." });
    }
}

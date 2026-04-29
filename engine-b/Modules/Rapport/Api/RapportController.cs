using engine_b.Modules.Rapport.Application;
using engine_b.Modules.Rapport.Application.Dtos;
using engine_b.Modules.Rapport.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace engine_b.Modules.Rapport.Api;

[ApiController]
[Route("api/rapport")]
[Authorize(Policy = "RapportRead")]
public class RapportController(
    RapportService rapportService,
    RapportCsvExporter csvExporter) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview([FromQuery] RapportOverviewQueryParams query)
    {
        try
        {
            return Ok(await rapportService.GetOverviewAsync(query));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("overview/export")]
    public async Task<IActionResult> ExportOverview(
        [FromQuery] string format = "csv",
        [FromQuery] RapportOverviewQueryParams? query = null)
    {
        try
        {
            var normalizedFormat = format.Trim().ToLowerInvariant();
            if (normalizedFormat != "csv")
            {
                return BadRequest(new
                {
                    error = $"Format '{normalizedFormat}' not implemented in v1. Supported format: csv."
                });
            }

            var overview = await rapportService.GetOverviewAsync(query ?? new RapportOverviewQueryParams());
            var content = csvExporter.ExportOverview(overview);
            var filename = $"rapport-overview-{DateTime.UtcNow:yyyyMMddHHmmss}.csv";
            return File(content, "text/csv; charset=utf-8", filename);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

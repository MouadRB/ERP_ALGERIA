using engine_b.Modules.CRM.Application;
using engine_b.Modules.CRM.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace engine_b.Modules.CRM.Api;

[ApiController]
[Route("api/crm")]
[Authorize(Policy = "CrmRead")]
public class CrmController(
    CustomerService customerService,
    SupportTicketService ticketService,
    CustomerInteractionService interactionService,
    FraudScoringService fraudScoringService) : ControllerBase
{
    // ══════════════════════════════════════════════════════════════════════════
    //  CUSTOMERS
    // ══════════════════════════════════════════════════════════════════════════

    // ── List (paged + filtered) ──────────────────────────────────────────────
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers([FromQuery] CustomerQueryParams query)
        => Ok(await customerService.GetCustomersAsync(query));

    // ── Single ───────────────────────────────────────────────────────────────
    [HttpGet("customers/{id:guid}")]
    public async Task<IActionResult> GetCustomer(Guid id)
    {
        var customer = await customerService.GetCustomerByIdAsync(id);
        return customer is not null ? Ok(customer) : NotFound();
    }

    // ── Full detail (tabs view: Profil, Tickets, Risque, Interactions) ───────
    [HttpGet("customers/{id:guid}/detail")]
    public async Task<IActionResult> GetCustomerDetail(Guid id)
    {
        var detail = await customerService.GetCustomerDetailAsync(id);
        return detail is not null ? Ok(detail) : NotFound();
    }

    // ── Order History ────────────────────────────────────────────────────────
    [HttpGet("customers/{id:guid}/orders")]
    public async Task<IActionResult> GetCustomerOrders(Guid id)
    {
        var orders = await customerService.GetCustomerOrdersAsync(id);
        return orders is not null ? Ok(orders) : NotFound();
    }

    // ── Risk & Fraud Profile ─────────────────────────────────────────────────
    [HttpGet("customers/{id:guid}/risk-profile")]
    public async Task<IActionResult> GetCustomerRiskProfile(Guid id)
    {
        var profile = await fraudScoringService.GetRiskProfileAsync(id);
        return profile is not null ? Ok(profile) : NotFound();
    }

    // ── Create ───────────────────────────────────────────────────────────────
    [HttpPost("customers")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        var customer = await customerService.CreateCustomerAsync(request);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    // ── Update ───────────────────────────────────────────────────────────────
    [HttpPut("customers/{id:guid}")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> UpdateCustomer(Guid id, [FromBody] UpdateCustomerRequest request)
    {
        var result = await customerService.UpdateCustomerAsync(id, request);
        return result is not null ? Ok(result) : NotFound();
    }

    // ── Delete ───────────────────────────────────────────────────────────────
    [HttpDelete("customers/{id:guid}")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
        => await customerService.DeleteCustomerAsync(id) ? NoContent() : NotFound();

    // ── KPI Stats ────────────────────────────────────────────────────────────
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
        => Ok(await customerService.GetStatsAsync());

    // ── Segments & Analytics dashboard payload ───────────────────────────────
    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
        => Ok(await customerService.GetAnalyticsAsync());

    // ── Filter metadata (dropdown options + counters) ────────────────────────
    [HttpGet("filters/metadata")]
    public async Task<IActionResult> GetFilterMetadata()
        => Ok(await customerService.GetFilterMetadataAsync());

    // ── Blacklist ────────────────────────────────────────────────────────────
    [HttpGet("customers/blacklist")]
    public async Task<IActionResult> GetBlacklist([FromQuery] CustomerQueryParams query)
    {
        query.IsBlacklisted = true;
        return Ok(await customerService.GetCustomersAsync(query));
    }

    [HttpPost("customers/{id:guid}/blacklist")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> Blacklist(Guid id, [FromBody] BlacklistRequest request)
    {
        var addedBy = User.Identity?.Name ?? "CRM Agent";
        return await customerService.BlacklistAsync(id, request.Reason, request.Notes, addedBy) ? Ok() : NotFound();
    }

    [HttpDelete("customers/{id:guid}/blacklist")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> Unblacklist(Guid id)
        => await customerService.UnblacklistAsync(id) ? Ok() : NotFound();

    // ── Merge Duplicates ─────────────────────────────────────────────────────
    [HttpPost("customers/{id:guid}/merge")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> Merge(Guid id, [FromBody] MergeCustomerRequest request, [FromServices] engine_b.Common.Infrastructure.Data.AppDbContext db)
    {
        var success = await customerService.MergeAsync(id, request.TargetCustomerId, db);
        return success ? Ok() : BadRequest("Valid source and target required.");
    }

    // ── Phone lookup (incoming call) ─────────────────────────────────────────
    [HttpGet("customers/lookup")]
    public async Task<IActionResult> LookupByPhone([FromQuery] string phone)
    {
        var customer = await customerService.LookupByPhoneAsync(phone);
        return customer is not null ? Ok(customer) : NotFound();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  CUSTOMER INTERACTIONS / NOTES  (Interactions & Notes tab in mockup 3)
    // ══════════════════════════════════════════════════════════════════════════

    // ── List all interactions for a customer ─────────────────────────────────
    [HttpGet("customers/{id:guid}/interactions")]
    public async Task<IActionResult> GetInteractions(Guid id)
        => Ok(await interactionService.GetByCustomerIdAsync(id));

    // ── Add a note / log an interaction ─────────────────────────────────────
    [HttpPost("customers/{id:guid}/interactions")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> AddInteraction(Guid id, [FromBody] CreateInteractionRequest request)
    {
        var agentName = User.Identity?.Name ?? "CRM Agent";
        var result = await interactionService.AddInteractionAsync(id, request, agentName);
        return result is not null
            ? Created($"api/crm/customers/{id}/interactions", result)
            : NotFound();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  SUPPORT TICKETS
    // ══════════════════════════════════════════════════════════════════════════

    // ── List (paged + filtered, with Priority & Search support) ─────────────
    [HttpGet("tickets")]
    public async Task<IActionResult> GetTickets([FromQuery] TicketQueryParams query)
        => Ok(await ticketService.GetTicketsAsync(query));

    // ── Stats summary (open / escalated counts for the summary bar) ─────────
    [HttpGet("tickets/stats")]
    public async Task<IActionResult> GetTicketStats()
        => Ok(await ticketService.GetTicketStatsAsync());

    // ── Single ───────────────────────────────────────────────────────────────
    [HttpGet("tickets/{id:guid}")]
    public async Task<IActionResult> GetTicket(Guid id)
    {
        var ticket = await ticketService.GetTicketByIdAsync(id);
        return ticket is not null ? Ok(ticket) : NotFound();
    }

    // ── Create ───────────────────────────────────────────────────────────────
    [HttpPost("tickets")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var ticket = await ticketService.CreateTicketAsync(request);
        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

    // ── Update ───────────────────────────────────────────────────────────────
    [HttpPut("tickets/{id:guid}")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> UpdateTicket(Guid id, [FromBody] UpdateTicketRequest request)
    {
        var result = await ticketService.UpdateTicketAsync(id, request);
        return result is not null ? Ok(result) : NotFound();
    }

    // ── Delete ───────────────────────────────────────────────────────────────
    [HttpDelete("tickets/{id:guid}")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> DeleteTicket(Guid id)
        => await ticketService.DeleteTicketAsync(id) ? NoContent() : NotFound();

    // ── Escalate ─────────────────────────────────────────────────────────────
    [HttpPost("tickets/{id:guid}/escalate")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> EscalateTicket(Guid id)
        => await ticketService.EscalateAsync(id)
            ? Ok(new { message = "Ticket escalated." })
            : NotFound();

    // ── Close (Fermer in the 3-dot menu) ────────────────────────────────────
    [HttpPost("tickets/{id:guid}/close")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> CloseTicket(Guid id)
        => await ticketService.CloseAsync(id)
            ? Ok(new { message = "Ticket closed." })
            : NotFound();

    // ── Assign (Assigner in the 3-dot menu) ─────────────────────────────────
    [HttpPost("tickets/{id:guid}/assign")]
    [Authorize(Policy = "CrmWrite")]
    public async Task<IActionResult> AssignTicket(Guid id, [FromBody] AssignTicketRequest request)
        => await ticketService.AssignAsync(id, request.AgentName)
            ? Ok(new { message = $"Ticket assigned to {request.AgentName}." })
            : NotFound();
}

public record BlacklistRequest(string Reason, string? Notes);
public record MergeCustomerRequest(Guid TargetCustomerId);

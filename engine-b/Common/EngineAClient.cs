using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using engine_b.Common.Multitenancy;

namespace engine_b.Common;

/// <summary>
/// Typed HTTP client for engine-a's OMS API. Engine-b's dashboard module reads
/// orders + KPIs from engine-a directly through this client; confirm-actions are
/// proxied to engine-a's lifecycle endpoints. Service-to-service auth uses a
/// SUPER_ADMIN-scoped JWT minted by <see cref="IServiceTokenProvider"/>.
/// </summary>
public interface IEngineAClient
{
    Task<EngineADashboardDto> GetDashboardAsync(CancellationToken ct = default);
    Task<bool> ConfirmOrderAsync(Guid orderId, CancellationToken ct = default);
}

public class EngineAClient(HttpClient http, IServiceTokenProvider tokens, ILogger<EngineAClient> logger)
    : IEngineAClient
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task<EngineADashboardDto> GetDashboardAsync(CancellationToken ct = default)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, "/oms/v1/dashboard");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens.Current());

        using var res = await http.SendAsync(req, ct);
        if (!res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadAsStringAsync(ct);
            logger.LogWarning("engine-a dashboard call failed {Status}: {Body}", (int)res.StatusCode, body);
            return new EngineADashboardDto();
        }

        var envelope = await res.Content.ReadFromJsonAsync<EngineAEnvelope<EngineADashboardDto>>(JsonOpts, ct);
        return envelope?.Data ?? new EngineADashboardDto();
    }

    public async Task<bool> ConfirmOrderAsync(Guid orderId, CancellationToken ct = default)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, $"/oms/v1/orders/{orderId}/confirm");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens.Current());

        using var res = await http.SendAsync(req, ct);
        if (res.IsSuccessStatusCode) return true;

        var body = await res.Content.ReadAsStringAsync(ct);
        logger.LogWarning("engine-a confirm-order {Id} failed {Status}: {Body}",
            orderId, (int)res.StatusCode, body);
        return false;
    }
}

// ── Wire DTOs (mirror engine-a's OmsDashboardResponse) ──────────────────────

public class EngineAEnvelope<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
}

public class EngineADashboardDto
{
    public EngineAKpisDto Kpis { get; set; } = new();
    public List<EngineAQueueItemDto> ConfirmationQueue { get; set; } = [];
    public EngineAFunnelDto CodFunnel { get; set; } = new();
    public EngineARiskDto RiskScore { get; set; } = new();
}

public class EngineAKpisDto
{
    public int OrdersToday { get; set; }
    public decimal OrdersVsYesterdayPct { get; set; }
    public int PendingConfirmation { get; set; }
    public int MaxWaitMinutes { get; set; }
    public decimal DeliveryRatePct { get; set; }
    public decimal DeliveryRateWeekTrendPct { get; set; }
    public int OutOfStockArticles { get; set; }
    public int NewOutOfStockToday { get; set; }
}

public class EngineAQueueItemDto
{
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public int ClientOrderCount { get; set; }
    public bool IsNewClient { get; set; }
    public int Wilaya { get; set; }
    public decimal Amount { get; set; }
    public string Risk { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int WaitingMinutes { get; set; }
}

public class EngineAFunnelDto
{
    public int TotalOrders { get; set; }
    public EngineAFunnelStepDto Passees { get; set; } = new();
    public EngineAFunnelStepDto Confirmees { get; set; } = new();
    public EngineAFunnelStepDto Expediees { get; set; } = new();
    public EngineAFunnelStepDto Livrees { get; set; } = new();
    public EngineAFunnelStepDto Remises { get; set; } = new();
    public EngineAFunnelStepDto Retournees { get; set; } = new();
}

public class EngineAFunnelStepDto
{
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}

public class EngineARiskDto
{
    public int TotalOrders { get; set; }
    public int FaibleCount { get; set; }
    public decimal FaiblePct { get; set; }
    public int MoyenCount { get; set; }
    public decimal MoyenPct { get; set; }
    public int EleveCount { get; set; }
    public decimal ElevePct { get; set; }
}

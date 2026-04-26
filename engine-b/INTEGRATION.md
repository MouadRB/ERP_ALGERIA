# Engine-B ↔ Engine-A ↔ MDM Integration — Build List

Ports: `mdm-service:8080`, `engine-a:8081`, `engine-b:8082`.
Both Java services already have outbox + poller. Engine-b already has outbox + dispatcher.
This file lists ONLY what is missing to make them talk over REST + outbox.

---

## What does NOT exist (gaps)

| # | Gap | Side | Severity |
|---|-----|------|----------|
| G1 | `POST /api/events/ingest` endpoint to receive envelopes | engine-b | blocker |
| G2 | `POST /api/events/ingest` endpoint to receive envelopes | engine-a | blocker |
| G3 | `POST /api/events/ingest` endpoint to receive envelopes | mdm-service | blocker |
| G4 | `EngineAClient.cs` body (file is a 1-line stub) | engine-b | blocker |
| G5 | `MdmClient.cs` body (file is a 1-line stub) | engine-b | blocker |
| G6 | `Outbox:WebhookUrls` is empty in `appsettings.json` | engine-b | blocker |
| G7 | Stale outbox routes pointing at unused ports 8083/8084 | engine-a, mdm | bug |
| G8 | Two different JWT secrets — engine-b cannot call engine-a/mdm | all 3 | blocker |
| G9 | Role naming mismatch (`SuperAdmin` vs `SUPER_ADMIN`) | engine-b token issuer | blocker |
| G10 | No `processed_events` idempotency table on any side | all 3 | bug |
| G11 | Engine-b port not pinned to 8082 | engine-b | config |
| G12 | No `InternalSystem` authorization policy on engine-b | engine-b | blocker |

---

## Step 1 — Pin engine-b port (G11)

`engine-b/Properties/launchSettings.json` → set `applicationUrl` to `http://localhost:8082`,
or run with `ASPNETCORE_URLS=http://+:8082`.

---

## Step 2 — Share the JWT secret (G8)

Set one env var on every host:
```
ERP_JWT_SECRET=<32+ char hex>
```

**engine-b** `appsettings.json`:
```json
"Jwt": { "Key": "${ERP_JWT_SECRET}", "Issuer": "engine-b", "Audience": "erp-algeria-clients", "ExpiresInMinutes": "60" }
```

**engine-a** & **mdm-service** `application.yml` (already present, just bind to the env):
```yaml
app:
  security:
    jwt:
      secret: ${ERP_JWT_SECRET}
```

---

## Step 3 — Dual-format role claims in engine-b (G9)

Edit `engine-b/Modules/Identity/Application/Services/TokenService.cs` `CreateToken`:

```csharp
var snakeRoles = roles.Select(ToUpperSnake).ToList();
foreach (var r in roles)        claims.Add(new Claim(ClaimTypes.Role, r));        // PascalCase
foreach (var r in snakeRoles)   claims.Add(new Claim("roles", r));                // UPPER_SNAKE for Java
// ToUpperSnake("SuperAdmin") => "SUPER_ADMIN"
```

---

## Step 4 — Inbound `/api/events/ingest` in engine-b (G1, G10, G12)

### 4.1 New file `engine-b/Modules/Integration/Domain/ProcessedEvent.cs`
```csharp
namespace engine_b.Modules.Integration.Domain;
public class ProcessedEvent { public Guid EventId { get; set; } public DateTime ProcessedAt { get; set; } }
```

### 4.2 Register in `Common/Infrastructure/Data/AppDbContext.cs`
```csharp
public DbSet<ProcessedEvent> ProcessedEvents => Set<ProcessedEvent>();
// in OnModelCreating:
builder.Entity<ProcessedEvent>(e => { e.ToTable("processed_events"); e.HasKey(x => x.EventId); });
```

### 4.3 Envelope + handler contract — `Modules/Integration/Application/Events.cs`
```csharp
public record InboundEventEnvelope(
    Guid EventId, string AggregateType, string AggregateId, string EventType,
    int EventVersion, string TenantId, JsonElement Payload, DateTime CreatedAt);

public interface IInboundEventHandler { string EventType { get; } Task HandleAsync(InboundEventEnvelope e, CancellationToken ct); }

public interface IEventDispatcher { Task DispatchAsync(InboundEventEnvelope e, CancellationToken ct); }

public class EventDispatcher(IEnumerable<IInboundEventHandler> handlers, AppDbContext db, ILogger<EventDispatcher> log) : IEventDispatcher
{
    private readonly Dictionary<string, IInboundEventHandler> _map =
        handlers.ToDictionary(h => h.EventType, StringComparer.Ordinal);

    public async Task DispatchAsync(InboundEventEnvelope env, CancellationToken ct)
    {
        if (await db.ProcessedEvents.AnyAsync(p => p.EventId == env.EventId, ct)) return;
        if (_map.TryGetValue(env.EventType, out var h)) await h.HandleAsync(env, ct);
        else log.LogWarning("No handler for {Type}", env.EventType);
        db.ProcessedEvents.Add(new ProcessedEvent { EventId = env.EventId, ProcessedAt = DateTime.UtcNow });
        await db.SaveChangesAsync(ct);
    }
}
```

### 4.4 Controller — `Modules/Integration/Api/EventsIngestController.cs`
```csharp
[ApiController]
[Route("api/events")]
[Authorize(Policy = "InternalSystem")]
public class EventsIngestController(IEventDispatcher dispatcher) : ControllerBase
{
    [HttpPost("ingest")]
    public async Task<IActionResult> Ingest([FromBody] InboundEventEnvelope env, CancellationToken ct)
    { await dispatcher.DispatchAsync(env, ct); return Accepted(); }
}
```

### 4.5 `InternalSystem` policy — append to `AuthorizationServiceCollectionExtensions.AddRbcaPolicies`
```csharp
options.AddPolicy("InternalSystem", p => p.RequireRole(AppRoleNames.SuperAdmin, "INTERNAL_SYSTEM"));
```

### 4.6 Register in `Program.cs`
```csharp
builder.Services.AddScoped<IEventDispatcher, EventDispatcher>();
// add one line per handler you implement:
builder.Services.AddScoped<IInboundEventHandler, OmsOrderConfirmedHandler>();
builder.Services.AddScoped<IInboundEventHandler, OmsShipmentDeliveredHandler>();
builder.Services.AddScoped<IInboundEventHandler, OmsShipmentFailedHandler>();
builder.Services.AddScoped<IInboundEventHandler, SkuRegisteredHandler>();
builder.Services.AddScoped<IInboundEventHandler, SkuActivatedHandler>();
builder.Services.AddScoped<IInboundEventHandler, SupplierRegisteredHandler>();
```

### 4.7 Handler skeleton (one per row in §7)
```csharp
public class SkuRegisteredHandler(AppDbContext db) : IInboundEventHandler
{
    public string EventType => "SKU_REGISTERED";
    public Task HandleAsync(InboundEventEnvelope e, CancellationToken ct) { /* upsert mdm_sku_cache */ return Task.CompletedTask; }
}
```

---

## Step 5 — Inbound `/api/events/ingest` in engine-a (G2, G10)

### 5.1 New file `engine-a/src/main/java/com/dz/erp/shared/integration/InboundEventEnvelope.java`
```java
public record InboundEventEnvelope(UUID eventId, String aggregateType, String aggregateId,
        String eventType, int eventVersion, String tenantId, JsonNode payload, Instant createdAt) {}
```

### 5.2 Idempotency entity
```java
@Entity @Table(name = "processed_events", schema = "pim_schema")
public class ProcessedEventEntity { @Id UUID eventId; Instant processedAt; /* getters/setters */ }
```

### 5.3 Dispatcher + handler interface
```java
public interface InboundEventHandler { String eventType(); void handle(InboundEventEnvelope e); }

@Component @RequiredArgsConstructor
public class InboundEventDispatcher {
    private final List<InboundEventHandler> handlers;
    private final ProcessedEventRepository processedRepo;
    private Map<String, InboundEventHandler> map;
    @PostConstruct void init() { map = handlers.stream().collect(Collectors.toMap(InboundEventHandler::eventType, h -> h)); }
    @Transactional public void dispatch(InboundEventEnvelope env) {
        if (processedRepo.existsById(env.eventId())) return;
        var h = map.get(env.eventType());
        if (h != null) h.handle(env);
        processedRepo.save(new ProcessedEventEntity(env.eventId(), Instant.now()));
    }
}
```

### 5.4 Controller `engine-a/src/main/java/com/dz/erp/shared/integration/EventsIngestController.java`
```java
@RestController @RequestMapping("/api/events") @RequiredArgsConstructor
public class EventsIngestController {
    private final InboundEventDispatcher dispatcher;
    @PostMapping("/ingest")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INTERNAL_SYSTEM')")
    public ResponseEntity<Void> ingest(@RequestBody InboundEventEnvelope env) { dispatcher.dispatch(env); return ResponseEntity.accepted().build(); }
}
```

Also whitelist `/api/events/ingest` for JWT-only access (already covered by `anyRequest().authenticated()` in `SecurityConfig`).

---

## Step 6 — Inbound `/api/events/ingest` in mdm-service (G3, G10)

Mirror Step 5 verbatim inside `mdm-service/src/main/java/com/dz/erp/shared/integration/`.
Single handler needed today:

```java
@Component @RequiredArgsConstructor
public class PurchaseOrderReceivedHandler implements InboundEventHandler {
    private final SupplierService suppliers;
    public String eventType() { return "purchase_order.received"; }
    public void handle(InboundEventEnvelope e) { suppliers.recordReceipt(e.payload()); }
}
```

---

## Step 7 — Outbox webhook fan-out (G6)

Edit `engine-b/appsettings.json`:
```json
"Outbox": {
  "PollingIntervalSeconds": 5, "MaxRetries": 5, "BatchSize": 50,
  "RetentionDays": 7, "CleanupIntervalHours": 6,
  "WebhookUrls": [
    "http://localhost:8081/api/events/ingest",
    "http://localhost:8080/api/events/ingest"
  ]
}
```

`OutboxDispatcher` already POSTs to every URL — no code change needed. Add a service-account
JWT to the dispatcher's outbound `HttpClient` (default-header `Authorization: Bearer …`,
issued at startup with role `INTERNAL_SYSTEM`).

---

## Step 8 — Re-point engine-a + mdm outbox routes (G7)

`engine-a/src/main/resources/application.yml` — replace the three target blocks with one:
```yaml
app:
  outbox:
    poll-interval-ms: 1000
    batch-size: 50
    retry-max: 3
    timeout-ms: 5000
    targets:
      - name: engine-b
        routes:
          DEFAULT: http://localhost:8082/api/events/ingest
```

`mdm-service/src/main/resources/application.yml` — same single target block.

Add the bearer header to `OutboxPoller.deliverEvent`:
```java
restClient.post().uri(url)
    .header("Authorization", "Bearer " + serviceTokenProvider.current())
    .body(Map.of(...)).retrieve().toBodilessEntity();
```

---

## Step 9 — `EngineAClient` in engine-b (G4)

Replace `engine-b/Common/EngineAClient.cs`:

```csharp
namespace engine_b.Common;

public interface IEngineAClient
{
    Task<JsonElement?> GetOrderAsync(Guid id, CancellationToken ct = default);
    Task<JsonElement?> GetStockBySkuAsync(string sku, CancellationToken ct = default);
}

public class EngineAClient(HttpClient http, IServiceTokenProvider tokens) : IEngineAClient
{
    public async Task<JsonElement?> GetOrderAsync(Guid id, CancellationToken ct)
        => await SendAsync(HttpMethod.Get, $"/oms/v1/orders/{id}", ct);

    public async Task<JsonElement?> GetStockBySkuAsync(string sku, CancellationToken ct)
        => await SendAsync(HttpMethod.Get, $"/inventory/v1/stock-records?sku={Uri.EscapeDataString(sku)}", ct);

    private async Task<JsonElement?> SendAsync(HttpMethod m, string path, CancellationToken ct)
    {
        var req = new HttpRequestMessage(m, path);
        req.Headers.Authorization = new("Bearer", tokens.Current());
        var res = await http.SendAsync(req, ct);
        if (res.StatusCode == HttpStatusCode.NotFound) return null;
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
    }
}
```

Register in `Program.cs`:
```csharp
builder.Services.AddScoped<IServiceTokenProvider, ServiceTokenProvider>();
builder.Services.AddHttpClient<IEngineAClient, EngineAClient>(c =>
{
    c.BaseAddress = new(builder.Configuration["Integrations:EngineA:BaseUrl"]!);
    c.Timeout = TimeSpan.FromSeconds(5);
});
```

---

## Step 10 — `MdmClient` in engine-b (G5)

Replace `engine-b/Common/MdmClient.cs`:

```csharp
namespace engine_b.Common;

public interface IMdmClient
{
    Task<JsonElement?> GetSkuAsync(string code, CancellationToken ct = default);
    Task<JsonElement?> GetSupplierAsync(string code, CancellationToken ct = default);
    Task<JsonElement> RegisterSupplierAsync(object body, CancellationToken ct = default);
}

public class MdmClient(HttpClient http, IServiceTokenProvider tokens) : IMdmClient
{
    public Task<JsonElement?> GetSkuAsync(string c, CancellationToken ct)      => GetAsync($"/mdm/v1/skus/{c}", ct);
    public Task<JsonElement?> GetSupplierAsync(string c, CancellationToken ct) => GetAsync($"/mdm/v1/suppliers/{c}", ct);

    public async Task<JsonElement> RegisterSupplierAsync(object body, CancellationToken ct)
    {
        var req = new HttpRequestMessage(HttpMethod.Post, "/mdm/v1/suppliers") { Content = JsonContent.Create(body) };
        req.Headers.Authorization = new("Bearer", tokens.Current());
        var res = await http.SendAsync(req, ct); res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
    }

    private async Task<JsonElement?> GetAsync(string path, CancellationToken ct)
    {
        var req = new HttpRequestMessage(HttpMethod.Get, path);
        req.Headers.Authorization = new("Bearer", tokens.Current());
        var res = await http.SendAsync(req, ct);
        if (res.StatusCode == HttpStatusCode.NotFound) return null;
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
    }
}
```

Register:
```csharp
builder.Services.AddHttpClient<IMdmClient, MdmClient>(c =>
{
    c.BaseAddress = new(builder.Configuration["Integrations:Mdm:BaseUrl"]!);
    c.Timeout = TimeSpan.FromSeconds(5);
});
```

`appsettings.json`:
```json
"Integrations": { "EngineA": { "BaseUrl": "http://localhost:8081" }, "Mdm": { "BaseUrl": "http://localhost:8080" } }
```

`IServiceTokenProvider`: tiny scoped service that calls `TokenService.CreateToken(serviceUser, ["SuperAdmin"])` once per startup and caches until 5 min before expiry.

---

## Wire envelope (must match on every side)

```json
{
  "eventId":       "uuid",
  "aggregateType": "string",
  "aggregateId":   "string",
  "eventType":     "string",
  "eventVersion":  1,
  "tenantId":      "default",
  "payload":       { "...": "..." },
  "createdAt":     "2026-04-25T12:34:56Z"
}
```

---

## Event → handler matrix (build these handlers)

| eventType                | Source     | Handler in engine-b                          |
|--------------------------|------------|----------------------------------------------|
| `OMS_ORDER_RECEIVED`     | engine-a   | upsert `Dashboard.Order` (status=EnAttente)  |
| `OMS_ORDER_CONFIRMED`    | engine-a   | `Dashboard.Order` (status=Confirmee)         |
| `OMS_ORDER_PACKED`       | engine-a   | `Dashboard.Order` (status=Packed)            |
| `OMS_ORDER_CANCELLED`    | engine-a   | `Dashboard.Order` + `CustomerInteraction`    |
| `OMS_ORDER_COMPLETED`    | engine-a   | `InvoiceService.GenerateFromOrderAsync`      |
| `OMS_SHIPMENT_DELIVERED` | engine-a   | `Dashboard.Order` (status=Livree)            |
| `OMS_SHIPMENT_FAILED`    | engine-a   | `SupportTicketService.Create`                |
| `OMS_RETURN_REQUESTED`   | engine-a   | `SupportTicketService.Create`                |
| `SKU_REGISTERED`         | mdm        | upsert `mdm_sku_cache`                       |
| `SKU_ACTIVATED`          | mdm        | flip cache row `IsActive=true`               |
| `SUPPLIER_REGISTERED`    | mdm        | `ProcurementRepository.UpsertSupplier`       |

| eventType                | Source     | Handler elsewhere                            |
|--------------------------|------------|----------------------------------------------|
| `purchase_order.received`| engine-b   | engine-a inventory stock-up + mdm supplier stats |
| `customer.blacklisted`   | engine-b   | engine-a CRM read-model                      |

---

## Smoke test

```bash
TOKEN=$(curl -s localhost:8082/api/auth/login -d '{"email":"…","password":"…"}' -H 'content-type: application/json' | jq -r .token)

curl -i localhost:8082/api/events/ingest -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{
  "eventId":"11111111-1111-1111-1111-111111111111",
  "aggregateType":"Sku","aggregateId":"SKU-001","eventType":"SKU_REGISTERED",
  "eventVersion":1,"tenantId":"default","payload":{"code":"SKU-001"},"createdAt":"2026-04-25T12:00:00Z"
}'
# expect: 202 Accepted; second call → still 202 but no double-write (idempotency)

curl localhost:8082/api/outbox/status -H "Authorization: Bearer $TOKEN"
```

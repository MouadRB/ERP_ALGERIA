using System.Text;
using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.CRM.Application;
using engine_b.Modules.CRM.Infrastructure;
using engine_b.Modules.Dashboard.Application;
using engine_b.Modules.Procurement.Application;
using engine_b.Modules.Procurement.Infrastructure;

using engine_b.Modules.Identity.Application.Services;
using engine_b.Modules.Identity.Application.Authorization;
using engine_b.Modules.Identity.Domain;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(w => w.Ignore(
               Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// ─── ASP.NET Core Identity ───────────────────────────────────────────────────
builder.Services
    .AddIdentity<AppUser, AppRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequireUppercase = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// ─── JWT + Google Authentication ──────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtSettings["Issuer"],
            ValidAudience            = jwtSettings["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(key),
            ClockSkew                = TimeSpan.Zero,
        };
    })
    .AddGoogle(options =>
    {
        var googleSection = builder.Configuration.GetSection("Authentication:Google");
        options.ClientId     = googleSection["ClientId"]!;
        options.ClientSecret = googleSection["ClientSecret"]!;
    });

builder.Services.AddAuthorization();
builder.Services.AddRbcaPolicies();

// ─── Identity Application Services ───────────────────────────────────────────
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<DataSeeder>();

// ─── Email Service ───────────────────────────────────────────────────────────
builder.Services.Configure<engine_b.Common.Email.SmtpSettings>(
    builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<engine_b.Common.Email.IEmailService,
    engine_b.Common.Email.SmtpEmailService>();

// ─── CRM Module Services ────────────────────────────────────────────────────
builder.Services.AddScoped<CustomerRepository>();
builder.Services.AddScoped<SupportTicketRepository>();
builder.Services.AddScoped<CustomerInteractionRepository>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<SupportTicketService>();
builder.Services.AddScoped<CustomerInteractionService>();
builder.Services.AddScoped<RfmCalculationJob>();
builder.Services.AddScoped<FraudScoringService>();
builder.Services.AddScoped<NotificationService>();

// ─── Dashboard Module Services ──────────────────────────────────────────────
// Dashboard reads order/KPI data straight from engine-a's /oms/v1/dashboard via
// EngineAClient. ServiceTokenProvider mints a SUPER_ADMIN-scoped JWT signed with
// the shared HS256 secret so engine-a accepts the call.
builder.Services.AddSingleton<engine_b.Common.Multitenancy.IServiceTokenProvider,
    engine_b.Common.Multitenancy.ServiceTokenProvider>();
builder.Services.AddHttpClient<engine_b.Common.IEngineAClient, engine_b.Common.EngineAClient>(c =>
{
    var baseUrl = builder.Configuration["Integrations:EngineA:BaseUrl"]
                  ?? "http://localhost:8081";
    c.BaseAddress = new Uri(baseUrl);
    c.Timeout = TimeSpan.FromSeconds(10);
});
builder.Services.AddScoped<DashboardService>();

// ─── Procurement Module Services ────────────────────────────────────────────
builder.Services.AddScoped<engine_b.Modules.Procurement.Infrastructure.ProcurementRepository>();
builder.Services.AddScoped<engine_b.Modules.Procurement.Application.ProcurementService>();

// ─── Finance Module Services ────────────────────────────────────────────────
builder.Services.AddScoped<engine_b.Modules.Finance.Infrastructure.FinanceRepository>();
builder.Services.AddScoped<engine_b.Modules.Finance.Application.InvoiceService>();
builder.Services.AddScoped<engine_b.Modules.Finance.Application.RevenueRecognitionService>();
builder.Services.AddScoped<engine_b.Modules.Finance.Application.DeferredRevenueService>();
builder.Services.AddScoped<engine_b.Modules.Finance.Application.PeriodLockService>();

// ─── Outbox (Transactional Outbox Pattern) ──────────────────────────────────
builder.Services.Configure<engine_b.Common.Outbox.OutboxSettings>(
    builder.Configuration.GetSection("Outbox"));
builder.Services.AddScoped<engine_b.Common.Outbox.IOutboxPublisher, engine_b.Common.Outbox.OutboxPublisher>();
builder.Services.AddHostedService<engine_b.Common.Outbox.OutboxDispatcher>();
builder.Services.AddHostedService<engine_b.Common.Outbox.OutboxCleanupJob>();

// ─── Inbound event dispatch (engine-a / mdm → engine-b) ─────────────────────
builder.Services.AddScoped<engine_b.Common.Inbound.EventDispatcher>();
builder.Services.AddScoped<engine_b.Common.Inbound.IEventHandler,
    engine_b.Common.Inbound.Handlers.OmsOrderEventHandler>();
builder.Services.AddScoped<engine_b.Common.Inbound.IEventHandler,
    engine_b.Common.Inbound.Handlers.OmsReturnEventHandler>();
builder.Services.AddScoped<engine_b.Common.Inbound.IEventHandler,
    engine_b.Common.Inbound.Handlers.InventoryEventHandler>();
builder.Services.AddScoped<engine_b.Common.Inbound.IEventHandler,
    engine_b.Common.Inbound.Handlers.MdmEventHandler>();

// ─── Controllers & API ───────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Seed Roles
using (var scope = app.Services.CreateScope())
{
    try
    {
        var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
        await seeder.SeedRolesAsync();
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Failed to seed roles. Continuing startup.");
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


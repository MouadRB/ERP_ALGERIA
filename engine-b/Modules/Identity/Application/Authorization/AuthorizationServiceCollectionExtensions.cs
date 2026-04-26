using engine_b.Modules.Identity.Application.Services;
using engine_b.Modules.Identity.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace engine_b.Modules.Identity.Application.Authorization;

public static class AuthorizationServiceCollectionExtensions
{
    public static IServiceCollection AddRbcaPolicies(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // --- CRM Module Policies ---
            options.AddPolicy("CrmRead", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.ProductManager,
                AppRoleNames.FinanceManager,
                AppRoleNames.CRMAgent,
                AppRoleNames.LogisticsAgent,
                AppRoleNames.ReportingAnalyst
            )));
            options.AddPolicy("CrmWrite", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.CRMAgent
            )));

            // --- Orders Module Policies ---
            options.AddPolicy("OrdersRead", policy => policy.RequireRole(Both(AppRoleNames.AllRoles.ToArray())));
            options.AddPolicy("OrdersWrite", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.LogisticsAgent
            )));

            // --- Procurement Module Policies ---
            options.AddPolicy("ProcurementRead", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.InventoryManager,
                AppRoleNames.FinanceManager,
                AppRoleNames.ProcurementManager,
                AppRoleNames.ReportingAnalyst
            )));
            options.AddPolicy("ProcurementWrite", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.ProcurementManager
            )));

            // --- Finance Module Policies ---
            options.AddPolicy("FinanceRead", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.ProcurementManager,
                AppRoleNames.FinanceManager,
                AppRoleNames.ReportingAnalyst
            )));
            options.AddPolicy("FinanceWrite", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.FinanceManager
            )));

            // --- MDM Module Policies ---
            options.AddPolicy("MdmRead", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.ProductManager,
                AppRoleNames.InventoryManager,
                AppRoleNames.FinanceManager,
                AppRoleNames.ProcurementManager,
                AppRoleNames.ReportingAnalyst
            )));
            options.AddPolicy("MdmWrite", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin
            )));

            // --- Inventory Module Policies ---
            options.AddPolicy("InventoryRead", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.ProductManager,
                AppRoleNames.InventoryManager,
                AppRoleNames.FinanceManager,
                AppRoleNames.ProcurementManager,
                AppRoleNames.LogisticsAgent,
                AppRoleNames.ReportingAnalyst
            )));
            options.AddPolicy("InventoryWrite", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.InventoryManager,
                AppRoleNames.WarehouseOperator
            )));

            // --- WMS Module Policies ---
            options.AddPolicy("WmsRead", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.InventoryManager,
                AppRoleNames.WarehouseOperator,
                AppRoleNames.LogisticsAgent,
                AppRoleNames.ReportingAnalyst
            )));
            options.AddPolicy("WmsWrite", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin,
                AppRoleNames.WarehouseOperator
            )));

            // --- Outbox Integration Policies ---
            options.AddPolicy("OutboxRead", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin
            )));
            options.AddPolicy("OutboxWrite", policy => policy.RequireRole(Both(
                AppRoleNames.SuperAdmin
            )));

            // --- Internal service-to-service policy ---
            // Used by engine-a / mdm calling engine-b's /api/events/ingest with a
            // service-account JWT. SuperAdmin (legacy) and INTERNAL_SYSTEM (the
            // dedicated service role) are both accepted.
            options.AddPolicy("InternalSystem", policy => policy.RequireRole(
                AppRoleNames.SuperAdmin,
                "SUPER_ADMIN",
                "INTERNAL_SYSTEM"
            ));
        });

        return services;
    }

    /// <summary>
    /// Returns each role name in both PascalCase and UPPER_SNAKE_CASE so that
    /// policies match tokens issued by engine-b (PascalCase via ClaimTypes.Role)
    /// and tokens issued by engine-a / mdm (UPPER_SNAKE via the custom "roles"
    /// claim, projected onto ClaimTypes.Role by the RolesClaimsTransformer).
    /// </summary>
    private static string[] Both(params string[] roles)
    {
        var set = new HashSet<string>(StringComparer.Ordinal);
        foreach (var role in roles)
        {
            set.Add(role);
            set.Add(TokenService.ToUpperSnake(role));
        }
        return set.ToArray();
    }
}

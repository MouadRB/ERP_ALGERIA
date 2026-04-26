namespace engine_b.Modules.Identity.Domain;

public static class AppRoleNames
{
    public const string SuperAdmin = "SuperAdmin";
    public const string ProductManager = "ProductManager";
    public const string InventoryManager = "InventoryManager";
    public const string FinanceManager = "FinanceManager";
    public const string WarehouseOperator = "WarehouseOperator";
    public const string ProcurementManager = "ProcurementManager";
    public const string CRMAgent = "CRMAgent";
    public const string LogisticsAgent = "LogisticsAgent";
    public const string ReportingAnalyst = "ReportingAnalyst";

    public static readonly IReadOnlyList<string> AllRoles = new[]
    {
        SuperAdmin,
        ProductManager,
        InventoryManager,
        FinanceManager,
        WarehouseOperator,
        ProcurementManager,
        CRMAgent,
        LogisticsAgent,
        ReportingAnalyst
    };
}
 
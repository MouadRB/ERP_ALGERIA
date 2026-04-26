using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Dashboard.Domain;
using engine_b.Modules.Finance.Application.Dtos;
using engine_b.Modules.Finance.Domain;
using engine_b.Modules.Finance.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Finance.Application;

/// <summary>
/// Tracks deferred revenue (confirmed-but-undelivered orders) and
/// FIFO inventory valuation. Powers the "Valorisation FIFO — 3 entrepôts" KPI.
/// </summary>
public class DeferredRevenueService(AppDbContext db, FinanceRepository repo)
{
    /// <summary>
    /// Deferred revenue = value of confirmed/shipped but not yet delivered orders.
    /// These orders have been confirmed but the cash hasn't been collected yet (COD).
    /// </summary>
    public async Task<DeferredRevenueSummaryDto> GetDeferredRevenueSummaryAsync()
    {
        var confirmed = await db.Set<Order>()
            .Where(o => o.Status == OrderStatus.Confirmee)
            .ToListAsync();

        var shipped = await db.Set<Order>()
            .Where(o => o.Status == OrderStatus.Expediee)
            .ToListAsync();

        return new DeferredRevenueSummaryDto
        {
            TotalDeferred = confirmed.Sum(o => o.Amount) + shipped.Sum(o => o.Amount),
            ConfirmedCount = confirmed.Count,
            ShippedCount = shipped.Count,
            ConfirmedValue = confirmed.Sum(o => o.Amount),
            ShippedValue = shipped.Sum(o => o.Amount),
        };
    }

    /// <summary>
    /// Aggregate FIFO valuation across all warehouses.
    /// Powers the "Valorisation FIFO — 48,420,000 DZD — 3 entrepôts" KPI card.
    /// </summary>
    public async Task<FifoValuationDto> GetFifoValuationAsync()
    {
        var layers = await repo.GetFifoLayersAsync();

        var warehouses = layers
            .GroupBy(l => l.Warehouse)
            .Select(g =>
            {
                var valuation = g.Sum(l => l.Quantity * l.UnitCost);
                return new FifoWarehouseSummaryDto
                {
                    Warehouse = g.Key,
                    Valuation = valuation,
                    SkuCount = g.Select(l => l.Sku).Distinct().Count(),
                    UnitCount = g.Sum(l => l.Quantity),
                };
            })
            .OrderByDescending(w => w.Valuation)
            .ToList();

        var totalVal = warehouses.Sum(w => w.Valuation);
        foreach (var w in warehouses)
            w.SharePercent = totalVal == 0 ? 0 : Math.Round(w.Valuation / totalVal * 100, 1);

        return new FifoValuationDto
        {
            TotalValuation = totalVal,
            WarehouseCount = warehouses.Count,
            TotalSkus = layers.Select(l => l.Sku).Distinct().Count(),
            TotalUnits = layers.Sum(l => l.Quantity),
            Warehouses = warehouses,
        };
    }

    /// <summary>
    /// Returns all active FIFO layers grouped by warehouse.
    /// </summary>
    public async Task<List<FifoLayerDto>> GetFifoLayersByWarehouseAsync(string? warehouse = null)
    {
        var layers = warehouse is not null
            ? await repo.GetFifoLayersByWarehouseAsync(warehouse)
            : await repo.GetFifoLayersAsync();

        return layers.Select(FifoLayerDto.FromEntity).ToList();
    }

    /// <summary>
    /// Create a new FIFO layer from a procurement receipt.
    /// Called internally when goods are received.
    /// </summary>
    public async Task<FifoLayerDto> CreateFifoLayerAsync(CreateFifoLayerRequest request)
    {
        var layer = new FifoLayer
        {
            Sku = request.Sku,
            ProductName = request.ProductName,
            Warehouse = request.Warehouse,
            Quantity = request.Quantity,
            UnitCost = request.UnitCost,
            PurchaseOrderId = request.PurchaseOrderId,
        };

        await repo.AddFifoLayerAsync(layer);
        return FifoLayerDto.FromEntity(layer);
    }
}

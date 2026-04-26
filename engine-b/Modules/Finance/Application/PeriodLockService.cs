using engine_b.Common.Outbox;
using engine_b.Modules.Finance.Application.Dtos;
using engine_b.Modules.Finance.Domain;
using engine_b.Modules.Finance.Infrastructure;

namespace engine_b.Modules.Finance.Application;

/// <summary>
/// Manages accounting periods (month-end close). Once a period is locked,
/// no new journal entries can be created within it. Once closed, it's finalized.
/// </summary>
public class PeriodLockService(FinanceRepository repo, IOutboxPublisher outbox)
{
    // ── List all periods ─────────────────────────────────────────────────────
    public async Task<List<PeriodDto>> GetPeriodsAsync()
    {
        var periods = await repo.GetPeriodsAsync();
        return periods.Select(PeriodDto.FromEntity).ToList();
    }

    // ── Current (active) period ──────────────────────────────────────────────
    public async Task<PeriodDto?> GetCurrentPeriodAsync()
    {
        var period = await repo.GetCurrentPeriodAsync();
        return period is null ? null : PeriodDto.FromEntity(period);
    }

    // ── Create ───────────────────────────────────────────────────────────────
    public async Task<PeriodDto> CreatePeriodAsync(CreatePeriodRequest request, string actor)
    {
        var period = new AccountingPeriod
        {
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = PeriodStatus.Open,
        };

        await outbox.PublishAsync("period.created", "AccountingPeriod", period.Id.ToString(), new
        {
            periodId = period.Id,
            name = period.Name,
            startDate = period.StartDate,
            endDate = period.EndDate,
            createdBy = actor,
            createdAt = period.CreatedAt,
        });

        await repo.AddPeriodAsync(period);
        return PeriodDto.FromEntity(period);
    }

    // ── Lock (Open → Locked) ─────────────────────────────────────────────────
    public async Task<(bool Success, string Message)> LockPeriodAsync(Guid id, string actor)
    {
        var period = await repo.GetPeriodByIdAsync(id);
        if (period is null) return (false, "Period not found.");
        if (period.Status != PeriodStatus.Open) return (false, "Only open periods can be locked.");

        period.Status = PeriodStatus.Locked;
        period.LockedAt = DateTime.UtcNow;
        period.LockedBy = actor;

        await outbox.PublishAsync("period.locked", "AccountingPeriod", period.Id.ToString(), new
        {
            periodId = period.Id,
            name = period.Name,
            lockedBy = actor,
            lockedAt = period.LockedAt,
        });

        await repo.UpdatePeriodAsync(period);
        return (true, $"Period '{period.Name}' locked.");
    }

    // ── Close (Locked → Closed) ──────────────────────────────────────────────
    public async Task<(bool Success, string Message)> ClosePeriodAsync(Guid id, string actor)
    {
        var period = await repo.GetPeriodByIdAsync(id);
        if (period is null) return (false, "Period not found.");
        if (period.Status != PeriodStatus.Locked) return (false, "Only locked periods can be closed.");

        period.Status = PeriodStatus.Closed;
        period.ClosedAt = DateTime.UtcNow;
        period.ClosedBy = actor;

        await outbox.PublishAsync("period.closed", "AccountingPeriod", period.Id.ToString(), new
        {
            periodId = period.Id,
            name = period.Name,
            closedBy = actor,
            closedAt = period.ClosedAt,
            journalEntryCount = period.JournalEntries.Count,
        });

        await repo.UpdatePeriodAsync(period);
        return (true, $"Period '{period.Name}' closed.");
    }

    // ── Reopen (Locked → Open) ───────────────────────────────────────────────
    public async Task<(bool Success, string Message)> ReopenPeriodAsync(Guid id, string actor)
    {
        var period = await repo.GetPeriodByIdAsync(id);
        if (period is null) return (false, "Period not found.");
        if (period.Status == PeriodStatus.Closed) return (false, "Closed periods cannot be reopened.");
        if (period.Status == PeriodStatus.Open) return (true, "Period is already open.");

        period.Status = PeriodStatus.Open;
        period.LockedAt = null;
        period.LockedBy = null;

        await outbox.PublishAsync("period.reopened", "AccountingPeriod", period.Id.ToString(), new
        {
            periodId = period.Id,
            name = period.Name,
            reopenedBy = actor,
            reopenedAt = DateTime.UtcNow,
        });

        await repo.UpdatePeriodAsync(period);
        return (true, $"Period '{period.Name}' reopened.");
    }
}

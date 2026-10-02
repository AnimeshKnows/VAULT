using InventoryOS.Application.DTOs.Audit;
using InventoryOS.Application.DTOs.Common;
using InventoryOS.Domain.Entities;

namespace InventoryOS.Application.Interfaces;

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog log, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<AuditLog> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? action,
        CancellationToken cancellationToken = default);
}

public interface IAuditLogService
{
    Task<PagedResult<AuditLogDto>> GetPagedAsync(
        int page,
        int pageSize,
        string? action,
        CancellationToken cancellationToken = default);
}

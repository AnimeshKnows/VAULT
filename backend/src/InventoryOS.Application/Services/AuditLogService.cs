using InventoryOS.Application.DTOs.Audit;
using InventoryOS.Application.DTOs.Common;
using InventoryOS.Application.Interfaces;

namespace InventoryOS.Application.Services;

public sealed class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _auditLogs;
    private readonly IUserRepository _users;

    public AuditLogService(IAuditLogRepository auditLogs, IUserRepository users)
    {
        _auditLogs = auditLogs;
        _users = users;
    }

    public async Task<PagedResult<AuditLogDto>> GetPagedAsync(
        int page,
        int pageSize,
        string? action,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, total) = await _auditLogs.GetPagedAsync(page, pageSize, action, cancellationToken);
        var userIds = items.Where(i => i.UserId.HasValue).Select(i => i.UserId!.Value).Distinct().ToList();
        var emailById = new Dictionary<Guid, string>();
        foreach (var userId in userIds)
        {
            var user = await _users.GetByIdAsync(userId, cancellationToken);
            if (user is not null)
            {
                emailById[userId] = user.Email;
            }
        }

        var dtos = items.Select(log => new AuditLogDto(
            log.Id,
            log.UserId,
            log.UserId.HasValue && emailById.TryGetValue(log.UserId.Value, out var email) ? email : null,
            log.Action,
            log.EntityName,
            log.EntityId,
            log.Details,
            log.Timestamp)).ToList();

        return new PagedResult<AuditLogDto>(dtos, page, pageSize, total);
    }
}

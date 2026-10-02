namespace InventoryOS.Application.DTOs.Audit;

public sealed record AuditLogDto(
    Guid Id,
    Guid? UserId,
    string? UserEmail,
    string Action,
    string EntityName,
    string EntityId,
    string? Details,
    DateTime Timestamp);

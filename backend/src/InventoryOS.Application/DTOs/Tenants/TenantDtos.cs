namespace InventoryOS.Application.DTOs.Tenants;

public sealed record TenantDto(
    Guid Id,
    string Name,
    bool IsActive,
    DateTime CreatedAt);

public sealed record UpdateTenantRequest(string Name);

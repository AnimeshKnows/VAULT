namespace InventoryOS.Application.DTOs.Auth;

public sealed record CurrentUserDto(
    Guid Id,
    Guid TenantId,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    bool IsActive);

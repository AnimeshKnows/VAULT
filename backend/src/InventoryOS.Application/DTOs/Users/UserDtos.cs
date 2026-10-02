using InventoryOS.Domain.Enums;

namespace InventoryOS.Application.DTOs.Users;

public sealed record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CreateUserRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    Role Role);

public sealed record UpdateUserRequest(
    string FirstName,
    string LastName,
    Role Role,
    bool IsActive);

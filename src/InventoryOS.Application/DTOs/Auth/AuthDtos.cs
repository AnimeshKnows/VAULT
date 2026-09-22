namespace InventoryOS.Application.DTOs.Auth;

public sealed record RegisterRequest(
    string TenantName,
    string Email,
    string Password,
    string FirstName,
    string LastName);

public sealed record LoginRequest(
    Guid TenantId,
    string Email,
    string Password);

public sealed record RefreshTokenRequest(string RefreshToken);

public sealed record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    Guid UserId,
    Guid TenantId,
    string Email,
    string Role);

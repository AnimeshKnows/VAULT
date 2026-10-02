using InventoryOS.Application.DTOs.Auth;
using InventoryOS.Domain.Entities;

namespace InventoryOS.Application.Interfaces;

public interface ITokenService
{
    (string AccessToken, DateTime ExpiresAt) GenerateAccessToken(User user);
    string GenerateRefreshToken();
    Task<AuthResponse> IssueTokensAsync(User user, CancellationToken cancellationToken = default);
    Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
}

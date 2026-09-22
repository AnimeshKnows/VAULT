using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using InventoryOS.Application.DTOs.Auth;
using InventoryOS.Application.Interfaces;
using InventoryOS.Application.Options;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Exceptions;
using InventoryOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace InventoryOS.Infrastructure.Identity;

public sealed class TokenService : ITokenService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentTenantService _currentTenant;
    private readonly JwtSettings _jwt;

    public TokenService(
        ApplicationDbContext context,
        ICurrentTenantService currentTenant,
        IOptions<JwtSettings> jwtOptions)
    {
        _context = context;
        _currentTenant = currentTenant;
        _jwt = jwtOptions.Value;
    }

    public (string AccessToken, DateTime ExpiresAt) GenerateAccessToken(User user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwt.AccessTokenExpirationMinutes);
        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()),
            new("email", user.Email),
            new("role", user.Role.ToString()),
            new("tenantId", user.TenantId.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public async Task<AuthResponse> IssueTokensAsync(User user, CancellationToken cancellationToken = default)
    {
        _currentTenant.SetTenantId(user.TenantId);

        var (accessToken, expiresAt) = GenerateAccessToken(user);
        var refreshTokenValue = GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            TenantId = user.TenantId,
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpirationDays)
        };

        await _context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            accessToken,
            refreshTokenValue,
            expiresAt,
            user.Id,
            user.TenantId,
            user.Email,
            user.Role.ToString());
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new UnauthorizedException("Refresh token is required.");
        }

        var existing = await _context.RefreshTokens
            .IgnoreQueryFilters()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == refreshToken, cancellationToken)
            ?? throw new UnauthorizedException("Invalid refresh token.");

        if (!existing.IsActive || existing.User is null || !existing.User.IsActive)
        {
            throw new UnauthorizedException("Refresh token is expired or revoked.");
        }

        existing.RevokedAt = DateTime.UtcNow;
        var replacement = GenerateRefreshToken();
        existing.ReplacedByToken = replacement;

        _currentTenant.SetTenantId(existing.TenantId);

        var (accessToken, expiresAt) = GenerateAccessToken(existing.User);
        await _context.RefreshTokens.AddAsync(new RefreshToken
        {
            TenantId = existing.TenantId,
            UserId = existing.UserId,
            Token = replacement,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpirationDays)
        }, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            accessToken,
            replacement,
            expiresAt,
            existing.User.Id,
            existing.User.TenantId,
            existing.User.Email,
            existing.User.Role.ToString());
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var existing = await _context.RefreshTokens
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Token == refreshToken, cancellationToken);

        if (existing is null || existing.RevokedAt is not null)
        {
            return;
        }

        existing.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }
}

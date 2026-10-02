using InventoryOS.Application.Options;
using Microsoft.Extensions.Options;

namespace InventoryOS.Api.Auth;

public static class AuthCookieNames
{
    public const string RefreshToken = "vault_refresh";
}

public sealed class AuthCookieService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly JwtSettings _jwt;
    private readonly IHostEnvironment _environment;

    public AuthCookieService(
        IHttpContextAccessor httpContextAccessor,
        IOptions<JwtSettings> jwt,
        IHostEnvironment environment)
    {
        _httpContextAccessor = httpContextAccessor;
        _jwt = jwt.Value;
        _environment = environment;
    }

    public void SetRefreshToken(string refreshToken)
    {
        var response = _httpContextAccessor.HttpContext?.Response
            ?? throw new InvalidOperationException("No active HTTP context.");

        response.Cookies.Append(
            AuthCookieNames.RefreshToken,
            refreshToken,
            BuildCookieOptions(TimeSpan.FromDays(Math.Max(1, _jwt.RefreshTokenExpirationDays))));
    }

    public string? GetRefreshToken()
        => _httpContextAccessor.HttpContext?.Request.Cookies[AuthCookieNames.RefreshToken];

    public void ClearRefreshToken()
    {
        var response = _httpContextAccessor.HttpContext?.Response;
        if (response is null)
        {
            return;
        }

        response.Cookies.Delete(AuthCookieNames.RefreshToken, BuildCookieOptions(TimeSpan.Zero));
    }

    private CookieOptions BuildCookieOptions(TimeSpan maxAge)
    {
        // Secure cookies require HTTPS. Dev often uses http://localhost:3000 via Vite proxy,
        // so only force Secure outside Development.
        var secure = !_environment.IsDevelopment();

        return new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            IsEssential = true,
            MaxAge = maxAge <= TimeSpan.Zero ? TimeSpan.FromSeconds(0) : maxAge
        };
    }
}

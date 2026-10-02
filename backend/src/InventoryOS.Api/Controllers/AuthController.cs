using InventoryOS.Api.Auth;
using InventoryOS.Application.DTOs.Auth;
using InventoryOS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace InventoryOS.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly AuthCookieService _authCookies;

    public AuthController(IAuthService authService, AuthCookieService authCookies)
    {
        _authService = authService;
        _authCookies = authCookies;
    }

    /// <summary>Tenant self-signup: creates Tenant + Admin user and returns JWT pair.</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-register")]
    public async Task<ActionResult<AuthResponse>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        _authCookies.SetRefreshToken(result.RefreshToken);
        return Ok(RedactRefreshToken(result));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-login")]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        _authCookies.SetRefreshToken(result.RefreshToken);
        return Ok(RedactRefreshToken(result));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-login")]
    public async Task<ActionResult<AuthResponse>> Refresh(
        [FromBody] RefreshTokenRequest? request,
        CancellationToken cancellationToken)
    {
        var refreshToken = request?.RefreshToken;
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            refreshToken = _authCookies.GetRefreshToken();
        }

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized();
        }

        var result = await _authService.RefreshAsync(
            new RefreshTokenRequest(refreshToken),
            cancellationToken);
        _authCookies.SetRefreshToken(result.RefreshToken);
        return Ok(RedactRefreshToken(result));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(
        [FromBody] RefreshTokenRequest? request,
        CancellationToken cancellationToken)
    {
        var refreshToken = request?.RefreshToken;
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            refreshToken = _authCookies.GetRefreshToken();
        }

        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await _authService.LogoutAsync(new RefreshTokenRequest(refreshToken), cancellationToken);
        }

        _authCookies.ClearRefreshToken();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CurrentUserDto>> Me(CancellationToken cancellationToken)
    {
        var result = await _authService.GetCurrentUserAsync(cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Refresh token is delivered via HttpOnly cookie only — omit from JSON so XSS cannot read it from the response body.
    /// </summary>
    private static AuthResponse RedactRefreshToken(AuthResponse result)
        => result with { RefreshToken = string.Empty };
}

using System.Security.Claims;
using InventoryOS.Application.Interfaces;

namespace InventoryOS.Api.Middleware;

/// <summary>
/// Rejects authenticated requests when the principal's user is missing or deactivated,
/// and keeps JWT role claims aligned with the database so demotions take effect immediately.
/// Must run after <c>UseAuthentication</c>.
/// </summary>
public sealed class ActiveUserMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ActiveUserMiddleware> _logger;

    public ActiveUserMiddleware(RequestDelegate next, ILogger<ActiveUserMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IUserRepository users)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            await _next(context);
            return;
        }

        var userIdClaim = context.User.FindFirst("sub")?.Value
            ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var claimRole = context.User.FindFirst("role")?.Value
            ?? context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            _logger.LogWarning("Authenticated request missing valid sub claim for {Path}", context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new
            {
                title = "Unauthorized",
                detail = "Invalid authentication token."
            });
            return;
        }

        var snapshot = await users.GetAuthSnapshotIgnoreFiltersAsync(userId, context.RequestAborted);
        if (snapshot is not { IsActive: true })
        {
            _logger.LogInformation("Rejected inactive or unknown user {UserId} on {Path}", userId, context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new
            {
                title = "Unauthorized",
                detail = "User account is inactive or no longer valid."
            });
            return;
        }

        var dbRole = snapshot.Value.Role;
        var roleMismatch = !string.IsNullOrEmpty(claimRole)
            && !string.IsNullOrEmpty(dbRole)
            && !string.Equals(claimRole, dbRole, StringComparison.OrdinalIgnoreCase);

        if (roleMismatch && context.User.Identity is ClaimsIdentity identity)
        {
            foreach (var claim in identity.FindAll("role").ToList())
            {
                identity.RemoveClaim(claim);
            }
            foreach (var claim in identity.FindAll(ClaimTypes.Role).ToList())
            {
                identity.RemoveClaim(claim);
            }
            identity.AddClaim(new Claim("role", dbRole));
        }

        await _next(context);
    }
}

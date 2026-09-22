using InventoryOS.Application.Interfaces;

namespace InventoryOS.Api.Middleware;

/// <summary>
/// Binds the current request's TenantId onto <see cref="ICurrentTenantService"/>
/// so EF Core global query filters receive a stable per-request tenant context.
/// Must run after <c>UseAuthentication</c> so JWT claims are available.
/// </summary>
public sealed class TenantResolutionMiddleware
{
    public const string TenantIdClaimType = "tenantId";
    public const string TenantIdHeaderName = "X-Tenant-Id";

    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolutionMiddleware> _logger;

    public TenantResolutionMiddleware(RequestDelegate next, ILogger<TenantResolutionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ICurrentTenantService currentTenantService)
    {
        if (TryResolveTenantId(context, out var tenantId))
        {
            currentTenantService.SetTenantId(tenantId);
            context.Items["TenantId"] = tenantId;
            _logger.LogDebug("Tenant context bound: {TenantId}", tenantId);
        }
        else
        {
            _logger.LogDebug("No TenantId resolved for {Path}", context.Request.Path);
        }

        await _next(context);
    }

    private static bool TryResolveTenantId(HttpContext context, out Guid tenantId)
    {
        // 1. JWT claims (preferred after authentication)
        var claimValue = context.User?.FindFirst(TenantIdClaimType)?.Value
                         ?? context.User?.FindFirst("TenantId")?.Value;

        if (!string.IsNullOrWhiteSpace(claimValue) && Guid.TryParse(claimValue, out tenantId))
        {
            return true;
        }

        // 2. Header fallback (pre-auth / integration callers)
        if (context.Request.Headers.TryGetValue(TenantIdHeaderName, out var headerValue)
            && Guid.TryParse(headerValue.ToString(), out tenantId))
        {
            return true;
        }

        tenantId = Guid.Empty;
        return false;
    }
}

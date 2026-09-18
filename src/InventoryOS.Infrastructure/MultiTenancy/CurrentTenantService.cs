using System.Security.Claims;
using InventoryOS.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace InventoryOS.Infrastructure.MultiTenancy;

public class CurrentTenantService : ICurrentTenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid? _explicitTenantId;

    public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? TenantId
    {
        get
        {
            if (_explicitTenantId.HasValue)
            {
                return _explicitTenantId;
            }

            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                return null;
            }

            // 1. Resolve from JWT Claims
            var tenantClaim = httpContext.User?.FindFirst("tenantId")?.Value 
                              ?? httpContext.User?.FindFirst("TenantId")?.Value;

            if (!string.IsNullOrWhiteSpace(tenantClaim) && Guid.TryParse(tenantClaim, out var claimTenantId))
            {
                return claimTenantId;
            }

            // 2. Fallback to HTTP Request Header (useful for pre-auth/public endpoints or integrations)
            if (httpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var headerValue) 
                && Guid.TryParse(headerValue.ToString(), out var headerTenantId))
            {
                return headerTenantId;
            }

            return null;
        }
    }

    public void SetTenantId(Guid tenantId)
    {
        _explicitTenantId = tenantId;
    }
}

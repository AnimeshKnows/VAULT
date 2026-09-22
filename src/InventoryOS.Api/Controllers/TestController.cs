using InventoryOS.Api.Authorization;
using InventoryOS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryOS.Api.Controllers;

/// <summary>
/// Secured endpoints used to verify JWT authentication, RBAC policies,
/// and tenant resolution middleware wiring.
/// </summary>
[ApiController]
[Route("api/test")]
public sealed class TestController : ControllerBase
{
    private readonly ICurrentTenantService _currentTenantService;
    private readonly ICurrentUserService _currentUserService;

    public TestController(
        ICurrentTenantService currentTenantService,
        ICurrentUserService currentUserService)
    {
        _currentTenantService = currentTenantService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Requires a valid JWT. Returns authenticated identity + resolved tenant context.
    /// </summary>
    [HttpGet("auth")]
    [Authorize]
    public IActionResult GetAuthContext()
    {
        return Ok(new
        {
            authenticated = _currentUserService.IsAuthenticated,
            userId = _currentUserService.UserId,
            email = _currentUserService.Email,
            role = _currentUserService.Role,
            tenantId = _currentTenantService.TenantId,
            claims = User.Claims.Select(c => new { c.Type, c.Value })
        });
    }

    /// <summary>
    /// Admin or Staff — CanManageInventory policy.
    /// </summary>
    [HttpGet("inventory")]
    [Authorize(Policy = AuthorizationPolicies.CanManageInventory)]
    public IActionResult GetInventoryProbe()
    {
        return Ok(new
        {
            policy = AuthorizationPolicies.CanManageInventory,
            tenantId = _currentTenantService.TenantId,
            role = _currentUserService.Role,
            message = "Inventory access granted."
        });
    }

    /// <summary>
    /// Admin only — RequireAdmin policy.
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Policy = AuthorizationPolicies.RequireAdmin)]
    public IActionResult GetAdminProbe()
    {
        return Ok(new
        {
            policy = AuthorizationPolicies.RequireAdmin,
            tenantId = _currentTenantService.TenantId,
            role = _currentUserService.Role,
            message = "Admin access granted."
        });
    }
}

using InventoryOS.Api.Authorization;
using InventoryOS.Application.DTOs.Tenants;
using InventoryOS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryOS.Api.Controllers;

[ApiController]
[Route("api/tenants")]
[Authorize]
public sealed class TenantsController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public TenantsController(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<TenantDto>> GetMe(CancellationToken cancellationToken)
    {
        var result = await _tenantService.GetCurrentAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPut("me")]
    [Authorize(Policy = AuthorizationPolicies.RequireAdmin)]
    public async Task<ActionResult<TenantDto>> UpdateMe(
        [FromBody] UpdateTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _tenantService.UpdateCurrentAsync(request, cancellationToken);
        return Ok(result);
    }
}

using InventoryOS.Api.Authorization;
using InventoryOS.Application.DTOs.Audit;
using InventoryOS.Application.DTOs.Common;
using InventoryOS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryOS.Api.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Policy = AuthorizationPolicies.CanManageInventory)]
public sealed class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AuditLogDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? action = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _auditLogService.GetPagedAsync(page, pageSize, action, cancellationToken);
        return Ok(result);
    }
}

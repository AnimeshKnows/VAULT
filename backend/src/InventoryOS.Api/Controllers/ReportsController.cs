using InventoryOS.Api.Authorization;
using InventoryOS.Application.DTOs.Reports;
using InventoryOS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryOS.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public sealed class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("summary")]
    [Authorize(Policy = AuthorizationPolicies.CanManageOrders)]
    public async Task<ActionResult<ReportSummaryDto>> Summary(CancellationToken cancellationToken)
    {
        var result = await _reportService.GetSummaryAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("order-volume")]
    [Authorize(Policy = AuthorizationPolicies.CanManageOrders)]
    public async Task<ActionResult<IReadOnlyList<OrderVolumeDayDto>>> OrderVolume(
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _reportService.GetOrderVolumeAsync(from, to, cancellationToken);
        return Ok(result);
    }

    [HttpGet("stock-valuation")]
    [Authorize(Policy = AuthorizationPolicies.CanManageInventory)]
    public async Task<ActionResult<StockValuationDto>> StockValuation(CancellationToken cancellationToken)
    {
        var result = await _reportService.GetStockValuationAsync(cancellationToken);
        return Ok(result);
    }
}

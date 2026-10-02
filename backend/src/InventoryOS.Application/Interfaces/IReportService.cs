using InventoryOS.Application.DTOs.Reports;

namespace InventoryOS.Application.Interfaces;

public interface IReportService
{
    Task<ReportSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrderVolumeDayDto>> GetOrderVolumeAsync(
        DateOnly? from,
        DateOnly? to,
        CancellationToken cancellationToken = default);
    Task<StockValuationDto> GetStockValuationAsync(CancellationToken cancellationToken = default);
}

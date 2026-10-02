namespace InventoryOS.Application.DTOs.Reports;

public sealed record ReportSummaryDto(
    int TotalProducts,
    int InStockCount,
    int LowStockCount,
    int OutOfStockCount,
    int TotalOrders,
    int DraftOrders,
    int ConfirmedOrders,
    int FulfilledOrders,
    int CancelledOrders,
    decimal Revenue);

public sealed record OrderVolumeDayDto(
    DateOnly Date,
    int Draft,
    int Confirmed,
    int Fulfilled,
    int Cancelled);

public sealed record StockValuationDto(
    decimal TotalValuation,
    IReadOnlyList<CategoryValuationDto> Categories);

public sealed record CategoryValuationDto(
    string Category,
    int ProductCount,
    int TotalUnits,
    decimal Valuation);

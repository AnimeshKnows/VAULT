using InventoryOS.Application.DTOs.Reports;
using InventoryOS.Application.Interfaces;
using InventoryOS.Domain.Enums;

namespace InventoryOS.Application.Services;

public sealed class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOrderRepository _orders;
    private readonly IProductRepository _products;

    public ReportService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
        _orders = unitOfWork.Orders;
        _products = unitOfWork.Products;
    }

    public async Task<ReportSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var products = await _products.ListAllAsync(cancellationToken);
        var orders = await _orders.ListAllAsync(cancellationToken);

        var inStock = products.Count(p => p.IsActive && p.Stock > p.LowStockThreshold);
        var lowStock = products.Count(p => p.IsActive && p.Stock > 0 && p.Stock <= p.LowStockThreshold);
        var outOfStock = products.Count(p => p.IsActive && p.Stock <= 0);

        var revenue = orders
            .Where(o => o.Status is OrderStatus.Confirmed or OrderStatus.Fulfilled)
            .Sum(o => o.TotalAmount);

        return new ReportSummaryDto(
            products.Count(p => p.IsActive),
            inStock,
            lowStock,
            outOfStock,
            orders.Count,
            orders.Count(o => o.Status == OrderStatus.Draft),
            orders.Count(o => o.Status == OrderStatus.Confirmed),
            orders.Count(o => o.Status == OrderStatus.Fulfilled),
            orders.Count(o => o.Status == OrderStatus.Cancelled),
            revenue);
    }

    public async Task<IReadOnlyList<OrderVolumeDayDto>> GetOrderVolumeAsync(
        DateOnly? from,
        DateOnly? to,
        CancellationToken cancellationToken = default)
    {
        var end = to ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var start = from ?? end.AddDays(-29);

        if (start > end)
        {
            (start, end) = (end, start);
        }

        var orders = await _orders.ListAllAsync(cancellationToken);
        var inRange = orders
            .Where(o =>
            {
                var d = DateOnly.FromDateTime(o.CreatedAt.ToUniversalTime());
                return d >= start && d <= end;
            })
            .ToList();

        var days = new List<OrderVolumeDayDto>();
        for (var d = start; d <= end; d = d.AddDays(1))
        {
            var dayOrders = inRange.Where(o => DateOnly.FromDateTime(o.CreatedAt.ToUniversalTime()) == d).ToList();
            days.Add(new OrderVolumeDayDto(
                d,
                dayOrders.Count(o => o.Status == OrderStatus.Draft),
                dayOrders.Count(o => o.Status == OrderStatus.Confirmed),
                dayOrders.Count(o => o.Status == OrderStatus.Fulfilled),
                dayOrders.Count(o => o.Status == OrderStatus.Cancelled)));
        }

        return days;
    }

    public async Task<StockValuationDto> GetStockValuationAsync(CancellationToken cancellationToken = default)
    {
        var products = (await _products.ListAllAsync(cancellationToken))
            .Where(p => p.IsActive)
            .ToList();

        var categories = products
            .GroupBy(p => string.IsNullOrWhiteSpace(p.Category) ? "Uncategorized" : p.Category)
            .Select(g => new CategoryValuationDto(
                g.Key,
                g.Count(),
                g.Sum(p => p.Stock),
                g.Sum(p => p.Price * p.Stock)))
            .OrderByDescending(c => c.Valuation)
            .ToList();

        return new StockValuationDto(categories.Sum(c => c.Valuation), categories);
    }
}

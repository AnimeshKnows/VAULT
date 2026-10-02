using InventoryOS.Application.Interfaces;
using InventoryOS.Application.Services;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Enums;
using Moq;

namespace InventoryOS.UnitTests.Services;

public class ReportServiceTests
{
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IProductRepository> _products = new();
    private readonly Mock<IOrderRepository> _orders = new();
    private readonly ReportService _sut;

    public ReportServiceTests()
    {
        _uow.SetupGet(x => x.Products).Returns(_products.Object);
        _uow.SetupGet(x => x.Orders).Returns(_orders.Object);
        _sut = new ReportService(_uow.Object);
    }

    [Fact]
    public async Task GetSummaryAsync_ComputesCountsAndRevenue()
    {
        _products.Setup(p => p.ListAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Product>
        {
            new() { IsActive = true, Stock = 20, LowStockThreshold = 5, Price = 10m, Category = "A" },
            new() { IsActive = true, Stock = 3, LowStockThreshold = 5, Price = 5m, Category = "A" },
            new() { IsActive = true, Stock = 0, LowStockThreshold = 5, Price = 2m, Category = "B" },
        });
        _orders.Setup(o => o.ListAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Order>
        {
            new() { Status = OrderStatus.Confirmed, TotalAmount = 100m },
            new() { Status = OrderStatus.Fulfilled, TotalAmount = 50m },
            new() { Status = OrderStatus.Draft, TotalAmount = 999m },
        });

        var summary = await _sut.GetSummaryAsync();

        Assert.Equal(3, summary.TotalProducts);
        Assert.Equal(1, summary.InStockCount);
        Assert.Equal(1, summary.LowStockCount);
        Assert.Equal(1, summary.OutOfStockCount);
        Assert.Equal(3, summary.TotalOrders);
        Assert.Equal(150m, summary.Revenue);
    }
}

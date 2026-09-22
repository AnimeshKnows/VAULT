using InventoryOS.Application.DTOs.Orders;
using InventoryOS.Application.Interfaces;
using InventoryOS.Application.Services;
using InventoryOS.Application.Validators;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Enums;
using InventoryOS.Domain.Exceptions;
using Moq;
using DomainValidationException = InventoryOS.Domain.Exceptions.ValidationException;

namespace InventoryOS.UnitTests.Services;

public class OrderServiceTests
{
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IProductRepository> _products = new();
    private readonly Mock<IOrderRepository> _orders = new();
    private readonly Mock<ICurrentTenantService> _tenant = new();
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _uow.SetupGet(x => x.Products).Returns(_products.Object);
        _uow.SetupGet(x => x.Orders).Returns(_orders.Object);
        _tenant.SetupGet(x => x.TenantId).Returns(_tenantId);

        // Execute callback inline (simulates transaction commit)
        _uow.Setup(x => x.ExecuteInTransactionAsync(It.IsAny<Func<Task<Guid>>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<Task<Guid>>, CancellationToken>((op, _) => op());
        _uow.Setup(x => x.ExecuteInTransactionAsync(It.IsAny<Func<Task<OrderDto>>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<Task<OrderDto>>, CancellationToken>((op, _) => op());

        _sut = new OrderService(_uow.Object, _tenant.Object, new CreateOrderRequestValidator());
    }

    [Fact]
    public async Task CreateAsync_WhenInsufficientStock_ThrowsValidationException()
    {
        var productId = Guid.NewGuid();
        _products.Setup(p => p.GetByIdAsync(productId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Product
            {
                Id = productId,
                TenantId = _tenantId,
                Name = "Widget",
                Sku = "W-1",
                Stock = 1,
                Price = 5m,
                IsActive = true,
                Category = "General"
            });
        _orders.Setup(o => o.GetByOrderNumberAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order?)null);

        var request = new CreateOrderRequest(
            "Customer",
            "c@example.com",
            new[] { new CreateOrderItemRequest(productId, 5) });

        await Assert.ThrowsAsync<DomainValidationException>(() => _sut.CreateAsync(request));
    }

    [Fact]
    public async Task CreateAsync_WhenStockAvailable_CreatesDraftOrder()
    {
        var productId = Guid.NewGuid();
        var product = new Product
        {
            Id = productId,
            TenantId = _tenantId,
            Name = "Widget",
            Sku = "W-1",
            Stock = 10,
            Price = 5m,
            IsActive = true,
            Category = "General"
        };
        _products.Setup(p => p.GetByIdAsync(productId, It.IsAny<CancellationToken>())).ReturnsAsync(product);
        _orders.Setup(o => o.GetByOrderNumberAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order?)null);

        Order? captured = null;
        _orders.Setup(o => o.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order order, CancellationToken _) =>
            {
                captured = order;
                return order;
            });
        _orders.Setup(o => o.GetOrderWithItemsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => captured);

        var request = new CreateOrderRequest(
            "Customer",
            "c@example.com",
            new[] { new CreateOrderItemRequest(productId, 2) });

        var result = await _sut.CreateAsync(request);

        Assert.Equal(nameof(OrderStatus.Draft), result.Status);
        Assert.Equal(10m, result.TotalAmount);
        Assert.Single(result.Items);
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenConfirmDraft_DecrementsStock()
    {
        var productId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        var product = new Product
        {
            Id = productId,
            TenantId = _tenantId,
            Name = "Widget",
            Sku = "W-1",
            Stock = 10,
            Price = 5m,
            IsActive = true,
            Category = "General"
        };
        var order = new Order
        {
            Id = orderId,
            TenantId = _tenantId,
            OrderNumber = "ORD-1",
            CustomerName = "Customer",
            CustomerEmail = "c@example.com",
            Status = OrderStatus.Draft,
            TotalAmount = 10m,
            Items =
            {
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    TenantId = _tenantId,
                    ProductId = productId,
                    Quantity = 2,
                    UnitPrice = 5m,
                    TotalPrice = 10m
                }
            }
        };

        _orders.Setup(o => o.GetOrderWithItemsAsync(orderId, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _products.Setup(p => p.GetByIdAsync(productId, It.IsAny<CancellationToken>())).ReturnsAsync(product);

        var result = await _sut.UpdateStatusAsync(orderId, new UpdateOrderStatusRequest(OrderStatus.Confirmed));

        Assert.Equal(nameof(OrderStatus.Confirmed), result.Status);
        Assert.Equal(8, product.Stock);
        _products.Verify(p => p.Update(It.Is<Product>(x => x.Stock == 8)), Times.Once);
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenInvalidTransition_ThrowsValidationException()
    {
        var orderId = Guid.NewGuid();
        var order = new Order
        {
            Id = orderId,
            TenantId = _tenantId,
            OrderNumber = "ORD-1",
            CustomerName = "Customer",
            CustomerEmail = "c@example.com",
            Status = OrderStatus.Fulfilled,
            Items = new List<OrderItem>()
        };
        _orders.Setup(o => o.GetOrderWithItemsAsync(orderId, It.IsAny<CancellationToken>())).ReturnsAsync(order);

        await Assert.ThrowsAsync<DomainValidationException>(
            () => _sut.UpdateStatusAsync(orderId, new UpdateOrderStatusRequest(OrderStatus.Draft)));
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenCancelConfirmed_Restocks()
    {
        var productId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        var product = new Product
        {
            Id = productId,
            TenantId = _tenantId,
            Name = "Widget",
            Sku = "W-1",
            Stock = 5,
            Price = 5m,
            IsActive = true,
            Category = "General"
        };
        var order = new Order
        {
            Id = orderId,
            TenantId = _tenantId,
            OrderNumber = "ORD-1",
            CustomerName = "Customer",
            CustomerEmail = "c@example.com",
            Status = OrderStatus.Confirmed,
            TotalAmount = 10m,
            Items =
            {
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    TenantId = _tenantId,
                    ProductId = productId,
                    Quantity = 2,
                    UnitPrice = 5m,
                    TotalPrice = 10m
                }
            }
        };

        _orders.Setup(o => o.GetOrderWithItemsAsync(orderId, It.IsAny<CancellationToken>())).ReturnsAsync(order);
        _products.Setup(p => p.GetByIdAsync(productId, It.IsAny<CancellationToken>())).ReturnsAsync(product);

        var result = await _sut.UpdateStatusAsync(orderId, new UpdateOrderStatusRequest(OrderStatus.Cancelled));

        Assert.Equal(nameof(OrderStatus.Cancelled), result.Status);
        Assert.Equal(7, product.Stock);
    }
}

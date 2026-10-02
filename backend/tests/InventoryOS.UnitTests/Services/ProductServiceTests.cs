using FluentValidation;
using InventoryOS.Application.DTOs.Products;
using InventoryOS.Application.Interfaces;
using InventoryOS.Application.Services;
using InventoryOS.Application.Validators;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Exceptions;
using Moq;
using DomainValidationException = InventoryOS.Domain.Exceptions.ValidationException;

namespace InventoryOS.UnitTests.Services;

public class ProductServiceTests
{
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IProductRepository> _products = new();
    private readonly Mock<ICurrentTenantService> _tenant = new();
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly ProductService _sut;

    public ProductServiceTests()
    {
        _uow.SetupGet(x => x.Products).Returns(_products.Object);
        _tenant.SetupGet(x => x.TenantId).Returns(_tenantId);

        _sut = new ProductService(
            _uow.Object,
            _tenant.Object,
            new CreateProductRequestValidator(),
            new UpdateProductRequestValidator(),
            new AdjustStockRequestValidator());
    }

    [Fact]
    public async Task GetByIdAsync_WhenMissing_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _products.Setup(p => p.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.GetByIdAsync(id));
    }

    [Fact]
    public async Task GetLowStockAsync_WhenProductsBelowThreshold_ReturnsMappedList()
    {
        var products = new List<Product>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = _tenantId,
                Name = "Widget",
                Sku = "W-1",
                Price = 9.99m,
                Stock = 2,
                LowStockThreshold = 5,
                Category = "General",
                IsActive = true
            }
        };
        _products.Setup(p => p.GetLowStockProductsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(products);

        var result = await _sut.GetLowStockAsync();

        Assert.Single(result);
        Assert.Equal("W-1", result[0].Sku);
        Assert.Equal(2, result[0].Stock);
    }

    [Fact]
    public async Task CreateAsync_WhenSkuAlreadyExists_ThrowsConflictException()
    {
        var request = new CreateProductRequest("Widget", "SKU-1", null, 10m, 5, 2, "General");
        _products.Setup(p => p.GetBySkuAsync("SKU-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Product { Sku = "SKU-1", TenantId = _tenantId });

        await Assert.ThrowsAsync<ConflictException>(() => _sut.CreateAsync(request));
    }

    [Fact]
    public async Task CreateAsync_WhenValid_AddsProductAndSaves()
    {
        var request = new CreateProductRequest("Widget", "SKU-1", "desc", 10m, 5, 2, "General");
        _products.Setup(p => p.GetBySkuAsync("SKU-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);
        _products.Setup(p => p.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product product, CancellationToken _) => product);

        var result = await _sut.CreateAsync(request);

        Assert.Equal("SKU-1", result.Sku);
        Assert.Equal(5, result.Stock);
        _products.Verify(p => p.AddAsync(It.Is<Product>(x => x.TenantId == _tenantId && x.Sku == "SKU-1"), It.IsAny<CancellationToken>()), Times.Once);
        _uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AdjustStockAsync_WhenDeltaWouldGoNegative_ThrowsValidationException()
    {
        var id = Guid.NewGuid();
        _products.Setup(p => p.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Product
            {
                Id = id,
                TenantId = _tenantId,
                Name = "Widget",
                Sku = "W-1",
                Stock = 3,
                Category = "General"
            });

        await Assert.ThrowsAsync<DomainValidationException>(
            () => _sut.AdjustStockAsync(id, new AdjustStockRequest(-5, "oversell")));
    }

    [Fact]
    public async Task AdjustStockAsync_WhenValidDelta_UpdatesStock()
    {
        var id = Guid.NewGuid();
        var product = new Product
        {
            Id = id,
            TenantId = _tenantId,
            Name = "Widget",
            Sku = "W-1",
            Stock = 10,
            Category = "General",
            Price = 1m
        };
        _products.Setup(p => p.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(product);

        var result = await _sut.AdjustStockAsync(id, new AdjustStockRequest(-3, "sale"));

        Assert.Equal(7, result.Stock);
        _products.Verify(p => p.Update(It.Is<Product>(x => x.Stock == 7)), Times.Once);
        _uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

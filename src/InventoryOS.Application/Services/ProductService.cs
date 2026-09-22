using FluentValidation;
using InventoryOS.Application.DTOs.Common;
using InventoryOS.Application.DTOs.Products;
using InventoryOS.Application.Interfaces;
using InventoryOS.Application.Mapping;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Exceptions;
using DomainValidationException = InventoryOS.Domain.Exceptions.ValidationException;

namespace InventoryOS.Application.Services;

public sealed class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenant;
    private readonly IValidator<CreateProductRequest> _createValidator;
    private readonly IValidator<UpdateProductRequest> _updateValidator;
    private readonly IValidator<AdjustStockRequest> _adjustValidator;

    public ProductService(
        IUnitOfWork unitOfWork,
        ICurrentTenantService currentTenant,
        IValidator<CreateProductRequest> createValidator,
        IValidator<UpdateProductRequest> updateValidator,
        IValidator<AdjustStockRequest> adjustValidator)
    {
        _unitOfWork = unitOfWork;
        _currentTenant = currentTenant;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _adjustValidator = adjustValidator;
    }

    public async Task<PagedResult<ProductListDto>> GetPagedAsync(
        int page,
        int pageSize,
        string? search,
        string? category,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, total) = await _unitOfWork.Products.GetPagedAsync(page, pageSize, search, category, cancellationToken);
        return new PagedResult<ProductListDto>(items.Select(p => p.ToListDto()).ToList(), page, pageSize, total);
    }

    public async Task<ProductDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);
        return product.ToDto();
    }

    public async Task<IReadOnlyList<ProductListDto>> GetLowStockAsync(CancellationToken cancellationToken = default)
    {
        var items = await _unitOfWork.Products.GetLowStockProductsAsync(cancellationToken);
        return items.Select(p => p.ToListDto()).ToList();
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        EnsureTenant();

        var existing = await _unitOfWork.Products.GetBySkuAsync(request.Sku, cancellationToken);
        if (existing is not null)
        {
            throw new ConflictException($"SKU '{request.Sku}' already exists for this tenant.");
        }

        var product = new Product
        {
            TenantId = _currentTenant.TenantId!.Value,
            Name = request.Name.Trim(),
            Sku = request.Sku.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            Stock = request.Stock,
            LowStockThreshold = request.LowStockThreshold,
            Category = request.Category.Trim(),
            IsActive = true
        };

        await _unitOfWork.Products.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return product.ToDto();
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        var skuOwner = await _unitOfWork.Products.GetBySkuAsync(request.Sku, cancellationToken);
        if (skuOwner is not null && skuOwner.Id != id)
        {
            throw new ConflictException($"SKU '{request.Sku}' already exists for this tenant.");
        }

        product.Name = request.Name.Trim();
        product.Sku = request.Sku.Trim();
        product.Description = request.Description?.Trim();
        product.Price = request.Price;
        product.LowStockThreshold = request.LowStockThreshold;
        product.Category = request.Category.Trim();
        product.IsActive = request.IsActive;

        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return product.ToDto();
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        _unitOfWork.Products.Delete(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<ProductDto> AdjustStockAsync(Guid id, AdjustStockRequest request, CancellationToken cancellationToken = default)
    {
        await _adjustValidator.ValidateAndThrowAsync(request, cancellationToken);

        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        var newStock = product.Stock + request.QuantityDelta;
        if (newStock < 0)
        {
            throw new DomainValidationException($"Insufficient stock. Current stock is {product.Stock}.");
        }

        product.Stock = newStock;
        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return product.ToDto();
    }

    private void EnsureTenant()
    {
        if (!_currentTenant.TenantId.HasValue || _currentTenant.TenantId == Guid.Empty)
        {
            throw new UnauthorizedException("Tenant context is required.");
        }
    }
}

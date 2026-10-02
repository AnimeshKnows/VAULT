using InventoryOS.Application.DTOs.Common;
using InventoryOS.Application.DTOs.Products;

namespace InventoryOS.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductListDto>> GetPagedAsync(int page, int pageSize, string? search, string? category, CancellationToken cancellationToken = default);
    Task<ProductDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductListDto>> GetLowStockAsync(CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductDto> AdjustStockAsync(Guid id, AdjustStockRequest request, CancellationToken cancellationToken = default);
}

namespace InventoryOS.Application.DTOs.Products;

public sealed record ProductDto(
    Guid Id,
    string Name,
    string Sku,
    string? Description,
    decimal Price,
    int Stock,
    int LowStockThreshold,
    string Category,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record ProductListDto(
    Guid Id,
    string Name,
    string Sku,
    decimal Price,
    int Stock,
    string Category,
    bool IsActive);

public sealed record CreateProductRequest(
    string Name,
    string Sku,
    string? Description,
    decimal Price,
    int Stock,
    int LowStockThreshold,
    string Category);

public sealed record UpdateProductRequest(
    string Name,
    string Sku,
    string? Description,
    decimal Price,
    int LowStockThreshold,
    string Category,
    bool IsActive);

public sealed record AdjustStockRequest(int QuantityDelta, string? Reason);

using InventoryOS.Application.DTOs.Orders;
using InventoryOS.Application.DTOs.Products;
using InventoryOS.Domain.Entities;

namespace InventoryOS.Application.Mapping;

public static class ProductMappings
{
    public static ProductDto ToDto(this Product product) => new(
        product.Id,
        product.Name,
        product.Sku,
        product.Description,
        product.Price,
        product.Stock,
        product.LowStockThreshold,
        product.Category,
        product.IsActive,
        product.CreatedAt,
        product.UpdatedAt);

    public static ProductListDto ToListDto(this Product product) => new(
        product.Id,
        product.Name,
        product.Sku,
        product.Price,
        product.Stock,
        product.Category,
        product.IsActive);
}

public static class OrderMappings
{
    public static OrderDto ToDto(this Order order) => new(
        order.Id,
        order.OrderNumber,
        order.CustomerName,
        order.CustomerEmail,
        order.Status.ToString(),
        order.TotalAmount,
        order.CreatedAt,
        order.UpdatedAt,
        order.Items.Select(i => i.ToDto()).ToList());

    public static OrderListDto ToListDto(this Order order) => new(
        order.Id,
        order.OrderNumber,
        order.CustomerName,
        order.Status.ToString(),
        order.TotalAmount,
        order.CreatedAt,
        order.Items.Count);

    public static OrderItemDto ToDto(this OrderItem item) => new(
        item.Id,
        item.ProductId,
        item.Product?.Name,
        item.Product?.Sku,
        item.Quantity,
        item.UnitPrice,
        item.TotalPrice);
}

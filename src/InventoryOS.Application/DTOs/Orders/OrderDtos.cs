using InventoryOS.Domain.Enums;

namespace InventoryOS.Application.DTOs.Orders;

public sealed record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string? ProductName,
    string? ProductSku,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice);

public sealed record OrderDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<OrderItemDto> Items);

public sealed record OrderListDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    int ItemCount);

public sealed record CreateOrderItemRequest(Guid ProductId, int Quantity);

public sealed record CreateOrderRequest(
    string CustomerName,
    string CustomerEmail,
    IReadOnlyList<CreateOrderItemRequest> Items);

public sealed record UpdateOrderStatusRequest(OrderStatus Status);

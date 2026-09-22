using InventoryOS.Application.DTOs.Common;
using InventoryOS.Application.DTOs.Orders;
using InventoryOS.Domain.Enums;

namespace InventoryOS.Application.Interfaces;

public interface IOrderService
{
    Task<PagedResult<OrderListDto>> GetPagedAsync(int page, int pageSize, OrderStatus? status, CancellationToken cancellationToken = default);
    Task<OrderDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrderDto> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<OrderDto> UpdateStatusAsync(Guid id, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default);
    Task CancelAsync(Guid id, CancellationToken cancellationToken = default);
}

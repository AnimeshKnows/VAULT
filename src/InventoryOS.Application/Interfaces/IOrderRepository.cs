using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Enums;

namespace InventoryOS.Application.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<Order?> GetOrderWithItemsAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Order> Items, int TotalCount)> GetPagedOrdersAsync(
        int page,
        int pageSize,
        OrderStatus? status = null,
        CancellationToken cancellationToken = default);
}

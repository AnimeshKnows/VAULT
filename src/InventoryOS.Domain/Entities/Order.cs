using InventoryOS.Domain.Common;
using InventoryOS.Domain.Enums;

namespace InventoryOS.Domain.Entities;

public class Order : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    public decimal TotalAmount { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

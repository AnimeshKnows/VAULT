using InventoryOS.Domain.Common;

namespace InventoryOS.Domain.Entities;

public class Product : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int LowStockThreshold { get; set; } = 10;
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

using InventoryOS.Domain.Common;

namespace InventoryOS.Domain.Entities;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? SettingsJson { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}

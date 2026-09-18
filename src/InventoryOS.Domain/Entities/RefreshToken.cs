using InventoryOS.Domain.Common;

namespace InventoryOS.Domain.Entities;

public class RefreshToken : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsRevoked && !IsExpired;

    public Guid UserId { get; set; }
    public User? User { get; set; }
}

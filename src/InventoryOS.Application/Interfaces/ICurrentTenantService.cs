namespace InventoryOS.Application.Interfaces;

public interface ICurrentTenantService
{
    Guid? TenantId { get; }
    void SetTenantId(Guid tenantId);
}

using InventoryOS.Application.DTOs.Tenants;

namespace InventoryOS.Application.Interfaces;

public interface ITenantService
{
    Task<TenantDto> GetCurrentAsync(CancellationToken cancellationToken = default);
    Task<TenantDto> UpdateCurrentAsync(UpdateTenantRequest request, CancellationToken cancellationToken = default);
}

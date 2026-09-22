using InventoryOS.Domain.Entities;

namespace InventoryOS.Application.Interfaces;

public interface IUserRepository : IRepository<User>
{
    /// <summary>Lookup for login/register — bypasses global tenant filter.</summary>
    Task<User?> GetByEmailAndTenantIgnoreFiltersAsync(string email, Guid tenantId, CancellationToken cancellationToken = default);

    Task<bool> EmailExistsForTenantIgnoreFiltersAsync(string email, Guid tenantId, CancellationToken cancellationToken = default);
}

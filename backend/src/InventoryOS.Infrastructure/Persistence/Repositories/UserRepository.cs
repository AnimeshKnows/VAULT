using InventoryOS.Application.Interfaces;
using InventoryOS.Domain.Entities;
using InventoryOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventoryOS.Infrastructure.Persistence.Repositories;

public sealed class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAndTenantIgnoreFiltersAsync(
        string email,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return await _dbSet
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                u => u.TenantId == tenantId && u.Email.ToLower() == normalized,
                cancellationToken);
    }

    public async Task<bool> EmailExistsForTenantIgnoreFiltersAsync(
        string email,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return await _dbSet
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(u => u.TenantId == tenantId && u.Email.ToLower() == normalized, cancellationToken);
    }
}

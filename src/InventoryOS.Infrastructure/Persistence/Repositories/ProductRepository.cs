using InventoryOS.Application.Interfaces;
using InventoryOS.Domain.Entities;
using InventoryOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventoryOS.Infrastructure.Persistence.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Product?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.Sku.ToLower() == sku.ToLower(), cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetLowStockProductsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(p => p.IsActive && p.Stock <= p.LowStockThreshold)
            .OrderBy(p => p.Stock)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Product> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        string? category = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchLower) || p.Sku.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            var categoryLower = category.Trim().ToLower();
            query = query.Where(p => p.Category.ToLower() == categoryLower);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}

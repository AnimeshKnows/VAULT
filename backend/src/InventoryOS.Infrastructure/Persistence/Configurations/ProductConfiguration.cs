using InventoryOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryOS.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Sku)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Category)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Price)
            .HasPrecision(18, 2);

        // Composite unique index for tenant-scoped SKU
        builder.HasIndex(p => new { p.TenantId, p.Sku })
            .IsUnique();

        // Index for tenant-scoped category filtering
        builder.HasIndex(p => new { p.TenantId, p.Category });

        // Index for low stock queries
        builder.HasIndex(p => new { p.TenantId, p.Stock });
    }
}

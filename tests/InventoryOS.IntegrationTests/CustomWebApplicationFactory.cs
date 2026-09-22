using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using InventoryOS.Application.Interfaces;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Enums;
using InventoryOS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;

namespace InventoryOS.IntegrationTests;

public sealed class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public const string JwtIssuer = "InventoryOS";
    public const string JwtAudience = "InventoryOS.Clients";
    public const string JwtKey = "TEST_SECRET_KEY_MUST_BE_AT_LEAST_32_CHARS!!";

    public string DatabaseName { get; } = $"InventoryOS_IT_{Guid.NewGuid():N}";

    public Guid TenantAId { get; } = Guid.NewGuid();
    public Guid TenantBId { get; } = Guid.NewGuid();
    public Guid TenantAUserId { get; } = Guid.NewGuid();
    public Guid TenantBUserId { get; } = Guid.NewGuid();
    public Guid TenantBProductId { get; } = Guid.NewGuid();
    public Guid TenantAProductId { get; } = Guid.NewGuid();

    private bool _seeded;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:DefaultConnection", "Host=localhost;Database=unused;");
        builder.UseSetting("Jwt:Issuer", JwtIssuer);
        builder.UseSetting("Jwt:Audience", JwtAudience);
        builder.UseSetting("Jwt:Key", JwtKey);
        builder.UseSetting("Jwt:AccessTokenExpirationMinutes", "60");
        builder.UseSetting("Jwt:RefreshTokenExpirationDays", "7");
        builder.UseSetting("AllowedOrigins", "http://localhost:3000");
        builder.UseSetting("AllowedHosts", "localhost;127.0.0.1");

        builder.ConfigureTestServices(services =>
        {
            // Remove all EF Core ApplicationDbContext registrations (Npgsql included)
            var toRemove = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>)
                    || d.ServiceType == typeof(DbContextOptions)
                    || d.ServiceType == typeof(ApplicationDbContext)
                    || d.ServiceType == typeof(IDbContextOptionsConfiguration<ApplicationDbContext>)
                    || (d.ServiceType.IsGenericType
                        && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)
                        && d.ServiceType.GenericTypeArguments[0] == typeof(ApplicationDbContext)))
                .ToList();

            foreach (var descriptor in toRemove)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase(DatabaseName));
        });
    }

    public async Task SeedAsync()
    {
        if (_seeded)
        {
            return;
        }

        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var tenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();

        await context.Database.EnsureCreatedAsync();

        context.Tenants.AddRange(
            new Tenant { Id = TenantAId, Name = "Tenant A", IsActive = true },
            new Tenant { Id = TenantBId, Name = "Tenant B", IsActive = true });
        await context.SaveChangesAsync();

        tenantService.SetTenantId(TenantAId);
        context.Users.Add(new User
        {
            Id = TenantAUserId,
            TenantId = TenantAId,
            Email = "admin-a@test.com",
            PasswordHash = "hash",
            FirstName = "Admin",
            LastName = "A",
            Role = Role.Admin,
            IsActive = true
        });
        context.Products.Add(new Product
        {
            Id = TenantAProductId,
            TenantId = TenantAId,
            Name = "Product A",
            Sku = "SKU-A",
            Price = 10m,
            Stock = 20,
            LowStockThreshold = 5,
            Category = "General",
            IsActive = true
        });
        await context.SaveChangesAsync();

        tenantService.SetTenantId(TenantBId);
        context.Users.Add(new User
        {
            Id = TenantBUserId,
            TenantId = TenantBId,
            Email = "admin-b@test.com",
            PasswordHash = "hash",
            FirstName = "Admin",
            LastName = "B",
            Role = Role.Admin,
            IsActive = true
        });
        context.Products.Add(new Product
        {
            Id = TenantBProductId,
            TenantId = TenantBId,
            Name = "Product B",
            Sku = "SKU-B",
            Price = 15m,
            Stock = 30,
            LowStockThreshold = 5,
            Category = "General",
            IsActive = true
        });
        await context.SaveChangesAsync();

        _seeded = true;
    }

    public HttpClient CreateAuthenticatedClient(Guid userId, Guid tenantId, string role = "Admin", string email = "user@test.com")
    {
        var client = CreateClient();
        var token = CreateJwt(userId, tenantId, role, email);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public static string CreateJwt(Guid userId, Guid tenantId, string role, string email)
    {
        var claims = new[]
        {
            new Claim("sub", userId.ToString()),
            new Claim("email", email),
            new Claim("role", role),
            new Claim("tenantId", tenantId.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: JwtIssuer,
            audience: JwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

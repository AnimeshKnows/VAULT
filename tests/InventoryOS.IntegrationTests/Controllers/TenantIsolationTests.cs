using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace InventoryOS.IntegrationTests.Controllers;

public class TenantIsolationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TenantIsolationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetProduct_WhenBelongsToOtherTenant_ReturnsNotFound()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateAuthenticatedClient(
            _factory.TenantAUserId,
            _factory.TenantAId,
            "Admin",
            "admin-a@test.com");

        // Tenant A requests Tenant B's product id — must not leak existence via 403
        var response = await client.GetAsync($"/api/products/{_factory.TenantBProductId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetProducts_OnlyReturnsCurrentTenantData()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateAuthenticatedClient(
            _factory.TenantAUserId,
            _factory.TenantAId,
            "Admin",
            "admin-a@test.com");

        var response = await client.GetAsync("/api/products");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var items = doc.RootElement.GetProperty("items");

        foreach (var item in items.EnumerateArray())
        {
            var sku = item.GetProperty("sku").GetString();
            Assert.NotEqual("SKU-B", sku);
        }

        Assert.Contains(items.EnumerateArray(), e => e.GetProperty("sku").GetString() == "SKU-A");
    }

    [Fact]
    public async Task UpdateProduct_WhenBelongsToOtherTenant_ReturnsNotFound()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateAuthenticatedClient(
            _factory.TenantAUserId,
            _factory.TenantAId,
            "Admin",
            "admin-a@test.com");

        var body = new
        {
            name = "Hacked",
            sku = "SKU-B",
            description = (string?)null,
            price = 1m,
            lowStockThreshold = 1,
            category = "General",
            isActive = true
        };

        var response = await client.PutAsJsonAsync($"/api/products/{_factory.TenantBProductId}", body);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteProduct_WhenBelongsToOtherTenant_ReturnsNotFound()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateAuthenticatedClient(
            _factory.TenantAUserId,
            _factory.TenantAId,
            "Admin",
            "admin-a@test.com");

        var response = await client.DeleteAsync($"/api/products/{_factory.TenantBProductId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

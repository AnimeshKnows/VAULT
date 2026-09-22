using System.Net;
using System.Text.Json;

namespace InventoryOS.IntegrationTests.Controllers;

public class AuthEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthEndpointTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetProducts_WithoutToken_ReturnsUnauthorized()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetProducts_WithValidJwt_ReturnsOk()
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
        Assert.True(doc.RootElement.TryGetProperty("items", out var items));
        Assert.True(items.GetArrayLength() >= 1);
    }

    [Fact]
    public async Task CancelOrder_WithStaffRole_ReturnsForbidden()
    {
        // OrdersController is Staff+Admin, but Cancel requires RequireAdmin.
        // Uses a production endpoint so Release CI (no Debug-only TestController) still validates RBAC.
        await _factory.SeedAsync();
        var client = _factory.CreateAuthenticatedClient(
            _factory.TenantAUserId,
            _factory.TenantAId,
            "Staff",
            "staff-a@test.com");

        var response = await client.DeleteAsync($"/api/orders/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}

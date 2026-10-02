using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using InventoryOS.Application.Interfaces;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Enums;
using InventoryOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

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
            _factory.TenantAStaffUserId,
            _factory.TenantAId,
            "Staff",
            "staff-a@test.com");

        var response = await client.DeleteAsync($"/api/orders/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateOrderStatus_Cancel_WithStaffRole_ReturnsForbidden()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateAuthenticatedClient(
            _factory.TenantAStaffUserId,
            _factory.TenantAId,
            "Staff",
            "staff-a@test.com");

        var response = await client.PutAsJsonAsync(
            $"/api/orders/{Guid.NewGuid()}/status",
            new { status = "Cancelled" });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetMe_WithoutToken_ReturnsUnauthorized()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMe_WithValidJwt_ReturnsOk()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateAuthenticatedClient(
            _factory.TenantAUserId,
            _factory.TenantAId,
            "Admin",
            "admin-a@test.com");

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.Equal("admin-a@test.com", doc.RootElement.GetProperty("email").GetString());
    }

    [Fact]
    public async Task ListUsers_WithStaffRole_ReturnsForbidden()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateAuthenticatedClient(
            _factory.TenantAStaffUserId,
            _factory.TenantAId,
            "Staff",
            "staff-a@test.com");

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ListUsers_WithAdminRole_ReturnsOk()
    {
        await _factory.SeedAsync();
        var client = _factory.CreateAuthenticatedClient(
            _factory.TenantAUserId,
            _factory.TenantAId,
            "Admin",
            "admin-a@test.com");

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetProducts_AfterUserDeactivated_ReturnsUnauthorized()
    {
        await _factory.SeedAsync();
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var tenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
        tenantService.SetTenantId(_factory.TenantAId);

        var staffId = Guid.NewGuid();
        db.Users.Add(new User
        {
            Id = staffId,
            TenantId = _factory.TenantAId,
            Email = "staff-active-check@test.com",
            PasswordHash = "hash",
            FirstName = "Staff",
            LastName = "Check",
            Role = Role.Staff,
            IsActive = true
        });
        await db.SaveChangesAsync();

        var client = _factory.CreateAuthenticatedClient(
            staffId,
            _factory.TenantAId,
            "Staff",
            "staff-active-check@test.com");

        var ok = await client.GetAsync("/api/products");
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);

        var user = await db.Users.IgnoreQueryFilters().FirstAsync(u => u.Id == staffId);
        user.IsActive = false;
        await db.SaveChangesAsync();

        var denied = await client.GetAsync("/api/products");
        Assert.Equal(HttpStatusCode.Unauthorized, denied.StatusCode);
    }

    [Fact]
    public async Task ListUsers_WithStaleAdminJwtAfterDbDemotionToStaff_ReturnsForbidden()
    {
        await _factory.SeedAsync();
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var tenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
        tenantService.SetTenantId(_factory.TenantAId);

        var demotedId = Guid.NewGuid();
        db.Users.Add(new User
        {
            Id = demotedId,
            TenantId = _factory.TenantAId,
            Email = "demoted-admin@test.com",
            PasswordHash = "hash",
            FirstName = "Demoted",
            LastName = "Admin",
            Role = Role.Staff,
            IsActive = true
        });
        await db.SaveChangesAsync();

        // Stale access token still says Admin after DB demotion to Staff.
        var client = _factory.CreateAuthenticatedClient(
            demotedId,
            _factory.TenantAId,
            "Admin",
            "demoted-admin@test.com");

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}

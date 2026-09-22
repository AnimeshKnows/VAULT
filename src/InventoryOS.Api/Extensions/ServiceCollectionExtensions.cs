using System.Text;
using InventoryOS.Api.Authorization;
using InventoryOS.Domain.Enums;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace InventoryOS.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var secretKey = jwtSettings["Key"]
            ?? throw new InvalidOperationException("JWT signing Key is not configured.");

        if (secretKey.Length < 32)
        {
            throw new InvalidOperationException(
                "JWT signing Key must be at least 32 characters for HS256.");
        }

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            // Preserve claim names as issued (tenantId, role, sub) instead of long URI mappings
            options.MapInboundClaims = false;

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ClockSkew = TimeSpan.FromMinutes(1),
                // Short claim names issued by our TokenService (sub, role, tenantId, email)
                RoleClaimType = "role",
                NameClaimType = "sub"
            };
        });

        // Policy-based RBAC per Docs/Security.md §5.2
        services.AddAuthorizationBuilder()
            .AddPolicy(AuthorizationPolicies.RequireAdmin, policy =>
                policy.RequireRole(nameof(Role.Admin)))
            .AddPolicy(AuthorizationPolicies.CanManageInventory, policy =>
                policy.RequireRole(nameof(Role.Admin), nameof(Role.Staff)))
            .AddPolicy(AuthorizationPolicies.CanDeleteInventory, policy =>
                policy.RequireRole(nameof(Role.Admin)))
            .AddPolicy(AuthorizationPolicies.CanManageOrders, policy =>
                policy.RequireRole(nameof(Role.Admin), nameof(Role.Staff)))
            .AddPolicy(AuthorizationPolicies.CanManageUsers, policy =>
                policy.RequireRole(nameof(Role.Admin)));

        return services;
    }
}

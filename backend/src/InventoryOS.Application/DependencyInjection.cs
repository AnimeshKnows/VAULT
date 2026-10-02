using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using InventoryOS.Application.Interfaces;
using InventoryOS.Application.Services;

namespace InventoryOS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();

        return services;
    }
}

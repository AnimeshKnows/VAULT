using Microsoft.Extensions.DependencyInjection;

namespace InventoryOS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Application layer services, handlers, and validators registration
        return services;
    }
}

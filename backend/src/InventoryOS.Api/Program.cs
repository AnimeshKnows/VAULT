using InventoryOS.Api.Auth;
using InventoryOS.Api.Extensions;
using InventoryOS.Api.Middleware;
using InventoryOS.Application;
using InventoryOS.Infrastructure;
using InventoryOS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog;
using Serilog.Formatting.Compact;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, config) =>
{
    config.ReadFrom.Configuration(context.Configuration)
          .ReadFrom.Services(services)
          .Enrich.FromLogContext()
          .Enrich.WithProperty("Application", "InventoryOS")
          .Enrich.WithProperty("Environment", context.HostingEnvironment.EnvironmentName)
          .WriteTo.Console(new CompactJsonFormatter());

    // File sink in Development for local debugging; Production relies on platform stdout
    if (context.HostingEnvironment.IsDevelopment())
    {
        config.WriteTo.File(
            new CompactJsonFormatter(),
            path: "logs/inventoryos-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 7);
    }
});

builder.Services.AddProblemDetails();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuthCookieService>();

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth-register", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(15),
                QueueLimit = 0
            }));
    options.AddPolicy("auth-login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0
            }));
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>("database");

// CORS — strict allow-list from AllowedOrigins (comma-separated)
var allowedOrigins = builder.Configuration["AllowedOrigins"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        // Restrictive allow-list only — never AllowAnyOrigin (any environment).
        if (allowedOrigins.Length == 0)
        {
            throw new InvalidOperationException(
                "AllowedOrigins must be configured (comma-separated frontend URLs). " +
                "Set via appsettings or environment variable AllowedOrigins.");
        }

        if (!builder.Environment.IsDevelopment()
            && allowedOrigins.Any(o =>
                o == "*"
                || o.Contains("localhost", StringComparison.OrdinalIgnoreCase)
                || o.StartsWith("http://", StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException(
                "Production AllowedOrigins must be explicit HTTPS frontend URLs (no *, localhost, or http://).");
        }

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 1. Exception handling (outermost)
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Correlation ID for structured log tracing
app.UseMiddleware<CorrelationIdMiddleware>();

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    // HSTS for non-Development — instruct clients to prefer HTTPS
    app.UseHsts();
}

// 2. HTTPS
app.UseHttpsRedirection();

// 3. CORS
app.UseCors("Frontend");

app.UseRateLimiter();

// 4. Authentication
app.UseAuthentication();

// 5. Reject deactivated users even if access JWT is still unexpired
app.UseMiddleware<ActiveUserMiddleware>();

// 6. Tenant resolution
app.UseMiddleware<TenantResolutionMiddleware>();

// 7. Authorization
app.UseAuthorization();

// 8. Controllers
app.MapControllers();

// Health — liveness (process up) + readiness (includes DB)
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => false // liveness: no dependency checks
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Name == "database"
});

app.Run();

// Expose entry point for WebApplicationFactory integration tests
public partial class Program;

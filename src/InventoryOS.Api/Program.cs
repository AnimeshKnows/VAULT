using InventoryOS.Api.Extensions;
using InventoryOS.Api.Middleware;
using InventoryOS.Application;
using InventoryOS.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin();
    });
});

var app = builder.Build();

// 1. Exception handling (outermost) — Docs/Rules & Coding Standards.md
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// 2. HTTPS
app.UseHttpsRedirection();

// 3. CORS
app.UseCors("DefaultCorsPolicy");

// 4. Authentication
app.UseAuthentication();

// 5. Tenant resolution (JWT claims → ICurrentTenantService)
app.UseMiddleware<TenantResolutionMiddleware>();

// 6. Authorization
app.UseAuthorization();

// 7. Controllers
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }));
app.MapGet("/health/ready", () => Results.Ok(new { status = "Ready", timestamp = DateTime.UtcNow }));

app.Run();

// Expose entry point for WebApplicationFactory integration tests
public partial class Program;

using InventoryOS.Api.Extensions;
using InventoryOS.Application;
using InventoryOS.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddProblemDetails();
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register Clean Architecture layers
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Authentication & Authorization (JWT)
builder.Services.AddJwtAuthentication(builder.Configuration);

// CORS
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

// Configure the HTTP request pipeline per Docs/Rules & Coding Standards.md
// 1. Exception Handling (outermost)
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.MapOpenApi();
}
else
{
    app.UseExceptionHandler();
}

// 2. HTTPS Redirection
app.UseHttpsRedirection();

// 3. CORS
app.UseCors("DefaultCorsPolicy");

// 4. Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// 5. Endpoint Routing & Controllers
app.MapControllers();

// Health check endpoints (Docs/PRD.md)
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }));
app.MapGet("/health/ready", () => Results.Ok(new { status = "Ready", timestamp = DateTime.UtcNow }));

app.Run();

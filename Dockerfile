# Multi-stage build for InventoryOS.Api (.NET 10)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props ./
COPY InventoryOS.sln ./
COPY src/InventoryOS.Domain/InventoryOS.Domain.csproj src/InventoryOS.Domain/
COPY src/InventoryOS.Application/InventoryOS.Application.csproj src/InventoryOS.Application/
COPY src/InventoryOS.Infrastructure/InventoryOS.Infrastructure.csproj src/InventoryOS.Infrastructure/
COPY src/InventoryOS.Api/InventoryOS.Api.csproj src/InventoryOS.Api/

RUN dotnet restore src/InventoryOS.Api/InventoryOS.Api.csproj

COPY src/ ./src/
RUN dotnet publish src/InventoryOS.Api/InventoryOS.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "InventoryOS.Api.dll"]

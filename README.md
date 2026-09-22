# VAULT

**Verified Access Unified Ledger for Tenants**

VAULT is a multi-tenant SaaS backend for inventory and order management. Each organization (tenant) gets strictly isolated data—products, orders, users, and tokens—while sharing a single application and PostgreSQL database.

> Solution / assemblies still use the technical name **InventoryOS** (`InventoryOS.sln`). Product name: **VAULT**.

---

## What it does

| Capability | Description |
| :--- | :--- |
| **Tenant signup** | Register creates a new tenant + Admin user and returns JWT + refresh token |
| **Auth** | Login, refresh-token rotation, logout (revoke) |
| **Inventory** | Product CRUD, stock adjustments, low-stock lists, paged search |
| **Orders** | Draft → Confirmed → Fulfilled / Cancelled; stock decrements on confirm |
| **Isolation** | Shared DB + `TenantId` + EF Core global query filters |
| **RBAC** | Admin vs Staff policies on inventory and orders |

---

## Tech stack

- **.NET 10** / ASP.NET Core Web API (controllers)
- **Clean Architecture:** Domain → Application → Infrastructure → Api
- **PostgreSQL** via EF Core + Npgsql
- **JWT Bearer** (HS256) + DB-backed refresh tokens
- **FluentValidation**, Serilog, health checks, Docker, GitHub Actions

```
InventoryOS.sln
├── src/
│   ├── InventoryOS.Domain
│   ├── InventoryOS.Application
│   ├── InventoryOS.Infrastructure
│   └── InventoryOS.Api
└── tests/
    ├── InventoryOS.UnitTests
    └── InventoryOS.IntegrationTests
```

---

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- PostgreSQL (local or hosted)
- Optional: Docker

---

## Quick start

### 1. Clone and restore

```bash
git clone https://github.com/AnimeshKnows/MIM.git
cd MIM
dotnet restore InventoryOS.sln
```

### 2. Configure secrets (Development)

From `src/InventoryOS.Api`:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=vault;Username=postgres;Password=YOUR_PASSWORD"
dotnet user-secrets set "Jwt:Key" "REPLACE_WITH_AT_LEAST_32_CHAR_SECRET_KEY!!"
```

`AllowedOrigins` for local frontends is already set in `appsettings.Development.json` (e.g. `http://localhost:5173`).

### 3. Apply migrations

```bash
dotnet ef database update \
  --project src/InventoryOS.Infrastructure \
  --startup-project src/InventoryOS.Api
```

### 4. Run the API

```bash
dotnet run --project src/InventoryOS.Api --launch-profile https
```

- HTTPS: `https://localhost:7137`
- HTTP: `http://localhost:5053`
- Liveness: `GET /health`
- Readiness (DB): `GET /health/ready`
- OpenAPI (Development): mapped when the app runs in Development

---

## API overview

### Auth

| Method | Route | Auth |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Anonymous — creates tenant + Admin |
| POST | `/api/auth/login` | Anonymous — requires `tenantId`, email, password |
| POST | `/api/auth/refresh` | Anonymous |
| POST | `/api/auth/logout` | Bearer |

### Products (`CanManageInventory`; delete = Admin)

| Method | Route |
| :--- | :--- |
| GET | `/api/products?page=&pageSize=&search=&category=` |
| GET | `/api/products/low-stock` |
| GET | `/api/products/{id}` |
| POST | `/api/products` |
| PUT | `/api/products/{id}` |
| POST | `/api/products/{id}/stock` |
| DELETE | `/api/products/{id}` |

### Orders (`CanManageOrders`; cancel = Admin)

| Method | Route |
| :--- | :--- |
| GET | `/api/orders?page=&pageSize=&status=` |
| GET | `/api/orders/{id}` |
| POST | `/api/orders` |
| PUT | `/api/orders/{id}/status` |
| DELETE | `/api/orders/{id}` |

Send authenticated requests with:

```http
Authorization: Bearer <access_token>
```

The access token includes claims: `sub`, `email`, `role` (`Admin` | `Staff`), `tenantId`.

---

## Multi-tenancy (how isolation works)

1. After JWT authentication, `TenantResolutionMiddleware` binds `tenantId` (claim, or `X-Tenant-Id` header fallback).
2. `ICurrentTenantService` exposes the current tenant for the request.
3. EF Core **global query filters** on all `ITenantScoped` entities enforce `TenantId == current`.
4. Cross-tenant IDs resolve as **404** (not 403), so existence is not leaked.

Login must include `TenantId` because emails are unique **per tenant**, not globally.

---

## Roles

| Role | Capabilities |
| :--- | :--- |
| **Admin** | Full inventory (including delete), orders (including cancel), all Staff permissions |
| **Staff** | Manage inventory and orders (no product delete / order cancel) |

---

## Tests

```bash
dotnet test InventoryOS.sln
```

- **Unit tests** — Product and Order service rules (Moq)
- **Integration tests** — JWT protection and tenant isolation (`WebApplicationFactory` + EF InMemory)

---

## Docker

```bash
docker build -t vault-api .
docker run --rm -p 8080:8080 \
  -e ConnectionStrings__DefaultConnection="Host=...;Database=vault;..." \
  -e Jwt__Key="YOUR_32_PLUS_CHAR_SECRET____________" \
  -e Jwt__Issuer="InventoryOS" \
  -e Jwt__Audience="InventoryOS.Clients" \
  -e AllowedOrigins="https://your-frontend.example.com" \
  -e ASPNETCORE_ENVIRONMENT=Production \
  vault-api
```

Container listens on port **8080**.

---

## Production / CI

Primary workflow: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

- Build & test on push/PR to `main`
- On `main` push: EF migrate → deploy to Azure App Service (when secrets are configured)

**Host settings to provide:**

| Variable | Purpose |
| :--- | :--- |
| `ConnectionStrings__DefaultConnection` | PostgreSQL |
| `Jwt__Key` | HS256 signing key (≥ 32 chars) |
| `Jwt__Issuer` / `Jwt__Audience` | Token validation |
| `AllowedOrigins` | Comma-separated HTTPS frontend URLs |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

Point platform health checks at `/health/ready`.

---

## Documentation

| Doc | Contents |
| :--- | :--- |
| [`Docs/Comprehensive_Project_Audit.md`](Docs/Comprehensive_Project_Audit.md) | Full architecture, domain, security, and gap analysis |
| [`Docs/PRD.md`](Docs/PRD.md) | Product requirements |
| [`Docs/Security.md`](Docs/Security.md) | Security design |
| [`Docs/Progress_Log.md`](Docs/Progress_Log.md) | Implementation progress |

---

## License

Private repository — all rights reserved unless otherwise stated by the owner.

# VAULT

**Verified Access Unified Ledger for Tenants**

Monorepo layout:

| Folder | Contents |
| :--- | :--- |
| [`backend/`](backend/) | .NET 10 InventoryOS API (solution, Docker, tests) |
| [`vault---inventoryos/`](vault---inventoryos/) | Frontend (Vite / React) |
| [`Docs/`](Docs/) | Obsidian project notes |

## Quick start

**Backend**

```bash
cd backend
dotnet restore InventoryOS.sln
dotnet run --project src/InventoryOS.Api --launch-profile https
```

See [`backend/README.md`](backend/README.md) for secrets, migrations, API routes, and Docker.

**Frontend**

```bash
cd vault---inventoryos
npm install
npm run dev
```

The UI proxies `/api-proxy` → `https://localhost:7137` (see `vault---inventoryos/vite.config.ts`). Start the backend first.

## CI/CD

GitHub Actions live at [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) and operate on the `backend/` folder.

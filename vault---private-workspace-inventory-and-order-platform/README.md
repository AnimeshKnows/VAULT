# VAULT private workspace UI

## Prerequisites
- Node.js 20+
- .NET 10 SDK
- Backend DB configured (see `/backend/README.md`)

## Run locally

### 1. API
```bash
cd backend
dotnet run --project src/InventoryOS.Api --launch-profile https
```
API listens on `https://localhost:7137` (and `http://localhost:5053`).

### 2. Frontend
```bash
cd vault---private-workspace-inventory-and-order-platform
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```
Open `http://localhost:3000`.

The Vite dev server proxies `/api-proxy` → `VITE_API_PROXY_TARGET` (default `https://localhost:7137`).

Use `npm install --legacy-peer-deps` if npm reports an esbuild peer conflict with Vite 8.

## Authenticated app

After login/signup you land in the workspace shell:

| Route | Page |
|-------|------|
| `/dashboard` | Overview KPIs + attention panels |
| `/products` | Catalog (table/grid) |
| `/orders` | Orders ledger |
| `/stock-adjustments` | Stock audit log |
| `/users` | Team (Admin only) |
| `/reports` | Summary / volume / valuation |
| `/settings` | Workspace + session |

Staff cannot open `/users` (redirect + toast). Design tokens and primitives live under `src/components/ui/` and `.cursor/rules/vault-ui.mdc`.

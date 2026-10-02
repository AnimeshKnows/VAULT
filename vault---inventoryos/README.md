# VAULT Frontend (InventoryOS UI)

React + Vite client for the VAULT multi-tenant inventory API.

## Prerequisites

- Node.js 20+
- Backend running from `../backend` (HTTPS profile on `https://localhost:7137`)

## Setup

```bash
cd vault---inventoryos
npm install
cp .env.example .env   # if needed
npm run dev
```

App: `http://localhost:3000`

By default the UI calls `/api-proxy/*`, which Vite forwards to `https://localhost:7137` (see `vite.config.ts`). Set `VITE_API_BASE_URL` to call the API directly instead.

## Linked API flows

| UI action | Backend |
| :--- | :--- |
| Signup | `POST /api/auth/register` (rate-limited; refresh via HttpOnly cookie) |
| Login (needs Tenant ID) | `POST /api/auth/login` (rate-limited) |
| Logout | `POST /api/auth/logout` |
| Products list / add / stock adjust | `/api/products*` |
| Orders list / create / status | `/api/orders*` (cancel = Admin `DELETE` only) |

Users, reports, and adjustment *history* remain local UI (no backend APIs yet).

## Auth notes

- Registration returns a **Tenant ID** — login requires it (emails are unique per tenant).
- **Access** token is kept in `sessionStorage` only (cleared when the tab closes).
- **Refresh** token is an **HttpOnly** cookie (`vault_refresh`) — not readable from JavaScript.
- Access tokens auto-refresh via `POST /api/auth/refresh` (cookie auth) when a call returns 401.
- Prefer the Vite `/api-proxy` so cookies stay same-site with the UI.

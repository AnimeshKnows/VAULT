export const ROUTES = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  products: '/products',
  orders: '/orders',
  'stock-adjustments': '/stock-adjustments',
  users: '/users',
  reports: '/reports',
  settings: '/settings',
} as const;

export type AppRouteKey = keyof typeof ROUTES;

export const PAGE_META: Record<
  Exclude<AppRouteKey, 'landing' | 'login' | 'signup'>,
  { title: string; index: string; label: string; description: string }
> = {
  dashboard: {
    title: 'Overview',
    index: 'S.01',
    label: 'OVERVIEW',
    description: 'Workspace health, attention items, and recent activity.',
  },
  products: {
    title: 'Catalog',
    index: 'S.02',
    label: 'CATALOG',
    description: 'SKUs, pricing, and on-hand stock for this workspace.',
  },
  orders: {
    title: 'Orders',
    index: 'S.03',
    label: 'ORDERS',
    description: 'Draft, confirm, fulfill, and track customer orders.',
  },
  'stock-adjustments': {
    title: 'Stock Log',
    index: 'S.04',
    label: 'STOCK LOG',
    description: 'Audit trail of every stock change in this workspace.',
  },
  users: {
    title: 'Team',
    index: 'S.05',
    label: 'TEAM',
    description: 'Admin and Staff access for this private workspace.',
  },
  reports: {
    title: 'Reports',
    index: 'S.06',
    label: 'REPORTS',
    description: 'Summary, order volume, and stock valuation.',
  },
  settings: {
    title: 'Workspace',
    index: 'S.07',
    label: 'WORKSPACE',
    description: 'Workspace identity, profile, and session.',
  },
};

export function pageKeyFromPath(pathname: string): keyof typeof PAGE_META | null {
  const entry = Object.entries(ROUTES).find(([, path]) => path === pathname);
  if (!entry) return null;
  const key = entry[0] as AppRouteKey;
  if (key === 'landing' || key === 'login' || key === 'signup') return null;
  return key;
}

import type { NavigationPage } from '../types';

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
} as const satisfies Record<NavigationPage, string>;

const PATH_TO_PAGE: Record<string, NavigationPage> = {
  '/': 'landing',
  '/login': 'login',
  '/signup': 'signup',
  '/dashboard': 'dashboard',
  '/products': 'products',
  '/orders': 'orders',
  '/stock-adjustments': 'stock-adjustments',
  '/users': 'users',
  '/reports': 'reports',
  '/settings': 'settings',
};

export function pathForPage(page: NavigationPage): string {
  return ROUTES[page];
}

export function pageFromPath(pathname: string): NavigationPage | null {
  return PATH_TO_PAGE[pathname] ?? null;
}

export const AUTHENTICATED_PAGES: NavigationPage[] = [
  'dashboard',
  'products',
  'orders',
  'stock-adjustments',
  'users',
  'reports',
  'settings',
];

export function isAuthenticatedPath(pathname: string): boolean {
  const page = pageFromPath(pathname);
  return page !== null && AUTHENTICATED_PAGES.includes(page);
}

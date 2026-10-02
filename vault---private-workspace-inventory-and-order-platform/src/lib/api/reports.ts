import { apiRequest } from './client';

export interface ReportSummary {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  fulfilledOrders: number;
  cancelledOrders: number;
  revenue: number;
}

export interface OrderVolumeDay {
  date: string;
  draft: number;
  confirmed: number;
  fulfilled: number;
  cancelled: number;
}

export interface StockValuation {
  totalValuation: number;
  categories: {
    category: string;
    productCount: number;
    totalUnits: number;
    valuation: number;
  }[];
}

export async function fetchReportSummary(): Promise<ReportSummary> {
  return apiRequest<ReportSummary>('/api/reports/summary');
}

export async function fetchOrderVolume(
  from?: string,
  to?: string
): Promise<OrderVolumeDay[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return apiRequest<OrderVolumeDay[]>(`/api/reports/order-volume${qs ? `?${qs}` : ''}`);
}

export async function fetchStockValuation(): Promise<StockValuation> {
  return apiRequest<StockValuation>('/api/reports/stock-valuation');
}

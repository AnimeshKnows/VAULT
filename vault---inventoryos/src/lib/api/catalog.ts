import { apiRequest } from './client';
import type { Order, OrderStatus, Product } from '../../types';

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  price: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ApiProductListItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
}

export interface ApiOrderItem {
  id: string;
  productId: string;
  productName?: string | null;
  productSku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string | null;
  items: ApiOrderItem[];
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80';

function stockStatus(stock: number, threshold: number): Product['status'] {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= threshold) return 'Low Stock';
  return 'In Stock';
}

export function mapProduct(dto: ApiProduct | ApiProductListItem): Product {
  const threshold =
    'lowStockThreshold' in dto && typeof dto.lowStockThreshold === 'number'
      ? dto.lowStockThreshold
      : 10;
  const updatedAt =
    'updatedAt' in dto && dto.updatedAt
      ? new Date(dto.updatedAt).toLocaleString()
      : 'updatedAt' in dto && dto.createdAt
        ? new Date(dto.createdAt).toLocaleString()
        : undefined;

  return {
    id: dto.id,
    name: dto.name,
    sku: dto.sku,
    currentStock: dto.stock,
    threshold,
    unitPrice: Number(dto.price),
    category: dto.category || 'General',
    image: PLACEHOLDER_IMAGE,
    warehouseBin: 'Zone Alpha // Bay TBD',
    status: stockStatus(dto.stock, threshold),
    lastAuditDate: updatedAt,
  };
}

export function mapOrder(dto: ApiOrder): Order {
  const status = dto.status as OrderStatus;
  return {
    id: dto.id,
    orderNumber: dto.orderNumber,
    customerName: dto.customerName,
    customerEmail: dto.customerEmail,
    status,
    totalAmount: Number(dto.totalAmount),
    createdAt: new Date(dto.createdAt).toLocaleString(),
    ledgerBlock: `TENANT-LEDGER // ${dto.orderNumber}`,
    items: (dto.items ?? []).map((item) => ({
      productId: item.productId,
      sku: item.productSku || '—',
      name: item.productName || 'Product',
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  };
}

export async function fetchProducts(pageSize = 100): Promise<Product[]> {
  const page = await apiRequest<PagedResult<ApiProductListItem>>(
    `/api/products?page=1&pageSize=${pageSize}`
  );
  return page.items.map((item) =>
    mapProduct({
      ...item,
      description: null,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    })
  );
}

export async function createProduct(input: {
  name: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
  description?: string;
}): Promise<Product> {
  const created = await apiRequest<ApiProduct>('/api/products', {
    method: 'POST',
    body: {
      name: input.name,
      sku: input.sku,
      description: input.description ?? null,
      price: input.price,
      stock: input.stock,
      lowStockThreshold: input.lowStockThreshold,
      category: input.category,
    },
  });
  return mapProduct(created);
}

export async function adjustProductStock(
  productId: string,
  quantityDelta: number,
  reason?: string
): Promise<Product> {
  const updated = await apiRequest<ApiProduct>(`/api/products/${productId}/stock`, {
    method: 'POST',
    body: { quantityDelta, reason: reason ?? null },
  });
  return mapProduct(updated);
}

export async function fetchOrders(pageSize = 100): Promise<Order[]> {
  const page = await apiRequest<PagedResult<{ id: string }>>(
    `/api/orders?page=1&pageSize=${pageSize}`
  );
  if (page.items.length === 0) return [];
  const details = await Promise.all(
    page.items.map((item) => apiRequest<ApiOrder>(`/api/orders/${item.id}`))
  );
  return details.map(mapOrder);
}

export async function createOrder(input: {
  customerName: string;
  customerEmail: string;
  items: { productId: string; quantity: number }[];
}): Promise<Order> {
  const created = await apiRequest<ApiOrder>('/api/orders', {
    method: 'POST',
    body: {
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      items: input.items,
    },
  });
  return mapOrder(created);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  if (status === 'Cancelled') {
    // Admin-only DELETE path (Staff cannot cancel via PUT status either)
    await apiRequest<void>(`/api/orders/${orderId}`, { method: 'DELETE' });
    const updated = await apiRequest<ApiOrder>(`/api/orders/${orderId}`);
    return mapOrder(updated);
  }

  const updated = await apiRequest<ApiOrder>(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    body: { status },
  });
  return mapOrder(updated);
}

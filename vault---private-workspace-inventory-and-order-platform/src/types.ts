export type OrderStatus = 'Draft' | 'Confirmed' | 'Fulfilled' | 'Cancelled';

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  createdAtRaw: string;
  items: OrderItem[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  threshold: number;
  unitPrice: number;
  category: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  description?: string | null;
  isActive: boolean;
  updatedAt?: string | null;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  timestamp: string;
  timestampRaw: string;
  sku: string;
  productName: string;
  type: string;
  delta: number;
  previousStock: number;
  newStock: number;
  reason: string;
  operatorBadge: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Staff';
  activeStatus: 'Active' | 'Inactive';
  lastActive: string;
}

export interface Tenant {
  id: string;
  name: string;
  isActive: boolean;
  skuCount: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'success' | 'info' | 'warning';
  read: boolean;
}

export interface CurrentUserProfile {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  displayName: string;
}

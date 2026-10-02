export type NavigationPage = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'stock-adjustments'
  | 'users'
  | 'reports'
  | 'settings';

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
  items: OrderItem[];
  ledgerBlock: string;
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  threshold: number;
  unitPrice: number;
  category: string;
  image: string;
  altText?: string;
  warehouseBin?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastAuditDate?: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  timestamp: string;
  sku: string;
  productName: string;
  type: 'Physical Audit' | 'Damage Write-off' | 'Inbound Receipt' | 'Reorder Arrival' | 'Manual Correction';
  delta: number;
  previousStock: number;
  newStock: number;
  reason: string;
  operatorBadge: string;
  binLocation: string;
  hash: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Warehouse Manager' | 'Dispatch Clerk' | 'Auditor';
  avatar: string;
  activeStatus: 'Active' | 'Offline';
  lastActive: string;
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
  skuCount: number;
  region: string;
  ledgerNode: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'success' | 'info' | 'warning';
  read: boolean;
}

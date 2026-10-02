import { createContext, useContext } from 'react';
import type {
  CurrentUserProfile,
  Order,
  OrderStatus,
  Product,
  StockAdjustment,
  SystemNotification,
  Tenant,
  UserAccount,
} from '../types';

export interface WorkspaceContextValue {
  bootstrapping: boolean;
  apiError: string | null;
  currentUser: CurrentUserProfile | null;
  tenant: Tenant | null;
  products: Product[];
  orders: Order[];
  adjustments: StockAdjustment[];
  users: UserAccount[];
  notifications: SystemNotification[];
  createOrderOpen: boolean;
  openCreateOrder: () => void;
  closeCreateOrder: () => void;
  loadWorkspace: () => Promise<void>;
  resetLocalState: () => void;
  clearNotification: (id: string) => void;
  createProduct: (input: {
    name: string;
    sku: string;
    category: string;
    unitPrice: number;
    initialStock: number;
    threshold: number;
    description?: string;
  }) => Promise<Product>;
  updateProduct: (
    id: string,
    input: {
      name: string;
      sku: string;
      category: string;
      unitPrice: number;
      threshold: number;
      description?: string | null;
      isActive: boolean;
    }
  ) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, delta: number, reason: string) => Promise<void>;
  createOrder: (input: {
    customerName: string;
    customerEmail: string;
    items: { productId: string; quantity: number }[];
    confirmImmediately?: boolean;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<Order>;
  inviteUser: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'Admin' | 'Staff';
  }) => Promise<void>;
  updateUser: (
    id: string,
    input: {
      firstName: string;
      lastName: string;
      role: 'Admin' | 'Staff';
      isActive: boolean;
    }
  ) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  updateTenantName: (name: string) => Promise<void>;
  executeReorder: (reps: { productId: string; addUnits: number }[]) => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}

export function useWorkspaceOptional(): WorkspaceContextValue | null {
  return useContext(WorkspaceContext);
}

export function useProducts() {
  const { products, createProduct, updateProduct, deleteProduct, adjustStock } = useWorkspace();
  return { products, createProduct, updateProduct, deleteProduct, adjustStock };
}

export function useOrders() {
  const { orders, createOrder, updateOrderStatus, openCreateOrder, closeCreateOrder, createOrderOpen } =
    useWorkspace();
  return { orders, createOrder, updateOrderStatus, openCreateOrder, closeCreateOrder, createOrderOpen };
}

export function useUsers() {
  const { users, inviteUser, updateUser, deactivateUser } = useWorkspace();
  return { users, inviteUser, updateUser, deactivateUser };
}

export function useTenant() {
  const { tenant, updateTenantName } = useWorkspace();
  return { tenant, updateTenantName };
}

export function useAudit() {
  const { adjustments } = useWorkspace();
  return { adjustments };
}

export function useCurrentUser() {
  const { currentUser } = useWorkspace();
  return currentUser;
}

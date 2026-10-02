import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  WorkspaceContext,
  type WorkspaceContextValue,
} from './workspaceContext';
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
import { fetchCurrentUser, isAuthenticated, clearAuthSession, ApiError } from '../utils/auth';
import { fetchCurrentTenant, updateCurrentTenant } from '../lib/api/tenants';
import {
  adjustProductStock,
  createOrder as apiCreateOrder,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  fetchOrders,
  fetchProducts,
  updateOrderStatus as apiUpdateOrderStatus,
  updateProduct as apiUpdateProduct,
} from '../lib/api/catalog';
import { fetchAuditLogs } from '../lib/api/audit';
import {
  createUser as apiCreateUser,
  deactivateUser as apiDeactivateUser,
  fetchUsers,
  updateUser as apiUpdateUser,
} from '../lib/api/users';
import { ROUTES } from '../lib/routes';
import { useToast } from '../components/ui';
import { friendlyApiMessage } from '../lib/errors';

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [bootstrapping, setBootstrapping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const hydrated = useRef(false);

  const addNotification = useCallback(
    (title: string, message: string, type: SystemNotification['type']) => {
      const tone =
        type === 'critical' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info';
      pushToast({ title, message, tone });
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title,
          message,
          time: 'Just now',
          type,
          read: false,
        },
        ...prev,
      ]);
    },
    [pushToast]
  );

  const resetLocalState = useCallback(() => {
    hydrated.current = false;
    setProducts([]);
    setOrders([]);
    setAdjustments([]);
    setUsers([]);
    setCurrentUser(null);
    setTenant(null);
    setNotifications([]);
    setApiError(null);
  }, []);

  const loadWorkspace = useCallback(async () => {
    if (!isAuthenticated()) return;
    setBootstrapping(true);
    setApiError(null);
    try {
      const [me, tenantDto, loadedProducts, loadedOrders, loadedAudit] = await Promise.all([
        fetchCurrentUser(),
        fetchCurrentTenant(),
        fetchProducts(),
        fetchOrders(),
        fetchAuditLogs(),
      ]);

      setCurrentUser({
        id: me.id,
        tenantId: me.tenantId,
        email: me.email,
        firstName: me.firstName,
        lastName: me.lastName,
        role: me.role,
        displayName: `${me.firstName} ${me.lastName}`.trim() || me.email,
      });
      setTenant({
        id: tenantDto.id,
        name: tenantDto.name,
        isActive: tenantDto.isActive,
        skuCount: loadedProducts.length,
      });
      setProducts(loadedProducts);
      setOrders(loadedOrders);
      setAdjustments(loadedAudit);

      if (me.role === 'Admin') {
        try {
          setUsers(await fetchUsers());
        } catch {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      const message = friendlyApiMessage(err, 'Failed to load workspace');
      setApiError(message);
      addNotification('Load Failed', message, 'critical');
      if (err instanceof ApiError && err.status === 401) {
        clearAuthSession();
        navigate(ROUTES.login, { replace: true });
      }
    } finally {
      setBootstrapping(false);
    }
  }, [addNotification, navigate]);

  useEffect(() => {
    if (!isAuthenticated()) {
      hydrated.current = false;
      return;
    }
    if (hydrated.current) return;
    hydrated.current = true;
    void loadWorkspace();
  }, [loadWorkspace]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      bootstrapping,
      apiError,
      currentUser,
      tenant,
      products,
      orders,
      adjustments,
      users,
      notifications,
      createOrderOpen,
      openCreateOrder: () => setCreateOrderOpen(true),
      closeCreateOrder: () => setCreateOrderOpen(false),
      loadWorkspace,
      resetLocalState,
      clearNotification: (id) => setNotifications((prev) => prev.filter((n) => n.id !== id)),

      createProduct: async (input) => {
        try {
          const created = await apiCreateProduct({
            name: input.name,
            sku: input.sku,
            category: input.category,
            price: input.unitPrice,
            stock: input.initialStock,
            lowStockThreshold: input.threshold,
            description: input.description,
          });
          setProducts((prev) => [created, ...prev]);
          setTenant((prev) => (prev ? { ...prev, skuCount: prev.skuCount + 1 } : prev));
          addNotification('Product Added', `${created.name} (${created.sku}) created.`, 'info');
          return created;
        } catch (err) {
          addNotification('Product Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      updateProduct: async (id, input) => {
        try {
          const updated = await apiUpdateProduct(id, {
            name: input.name,
            sku: input.sku,
            category: input.category,
            price: input.unitPrice,
            lowStockThreshold: input.threshold,
            description: input.description,
            isActive: input.isActive,
          });
          setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
          addNotification('Product Updated', `${updated.name} saved.`, 'success');
          return updated;
        } catch (err) {
          addNotification('Update Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      deleteProduct: async (id) => {
        try {
          await apiDeleteProduct(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
          setTenant((prev) =>
            prev ? { ...prev, skuCount: Math.max(0, prev.skuCount - 1) } : prev
          );
          addNotification('Product Deleted', 'SKU removed from catalog.', 'warning');
        } catch (err) {
          addNotification('Delete Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      adjustStock: async (productId, delta, reason) => {
        try {
          const updated = await adjustProductStock(productId, delta, reason);
          setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
          setAdjustments(await fetchAuditLogs());
          addNotification(
            'Stock Adjusted',
            `${updated.name} ${delta > 0 ? `+${delta}` : delta}.`,
            delta > 0 ? 'success' : 'warning'
          );
        } catch (err) {
          addNotification('Stock Adjust Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      createOrder: async (draft) => {
        try {
          let created = await apiCreateOrder({
            customerName: draft.customerName,
            customerEmail: draft.customerEmail,
            items: draft.items,
          });
          if (draft.confirmImmediately) {
            created = await apiUpdateOrderStatus(created.id, 'Confirmed');
            setProducts(await fetchProducts());
          }
          setOrders((prev) => [created, ...prev]);
          addNotification(
            'Order Created',
            `Order ${created.orderNumber} for ${created.customerName}.`,
            'success'
          );
          return created;
        } catch (err) {
          addNotification('Order Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      updateOrderStatus: async (orderId, status: OrderStatus) => {
        try {
          const updated = await apiUpdateOrderStatus(orderId, status);
          setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
          if (status === 'Confirmed' || status === 'Cancelled') {
            setProducts(await fetchProducts());
          }
          addNotification('Order Updated', `${updated.orderNumber} is now ${status}.`, 'info');
          return updated;
        } catch (err) {
          addNotification('Status Update Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      inviteUser: async (input) => {
        try {
          const created = await apiCreateUser(input);
          setUsers((prev) => [...prev, created]);
          addNotification('Member Invited', `${created.name} added as ${created.role}.`, 'success');
        } catch (err) {
          addNotification('Invite Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      updateUser: async (id, input) => {
        try {
          const updated = await apiUpdateUser(id, input);
          setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
          addNotification('Member Updated', `${updated.name} saved.`, 'success');
        } catch (err) {
          addNotification('Update Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      deactivateUser: async (id) => {
        try {
          await apiDeactivateUser(id);
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, activeStatus: 'Inactive' as const } : u))
          );
          addNotification('Member Deactivated', 'User access revoked.', 'warning');
        } catch (err) {
          addNotification('Deactivate Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      updateTenantName: async (name) => {
        try {
          const updated = await updateCurrentTenant(name);
          setTenant((prev) =>
            prev
              ? { ...prev, name: updated.name }
              : {
                  id: updated.id,
                  name: updated.name,
                  isActive: updated.isActive,
                  skuCount: products.length,
                }
          );
          addNotification('Tenant Updated', `Workspace renamed to ${updated.name}.`, 'success');
        } catch (err) {
          addNotification('Rename Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },

      executeReorder: async (reps) => {
        try {
          for (const rep of reps) {
            await adjustProductStock(rep.productId, rep.addUnits, 'Automated deficit replenishment');
          }
          setProducts(await fetchProducts());
          setAdjustments(await fetchAuditLogs());
          addNotification('Replenishment Complete', `Restocked ${reps.length} items.`, 'success');
        } catch (err) {
          addNotification('Reorder Failed', friendlyApiMessage(err), 'critical');
          throw err;
        }
      },
    }),
    [
      bootstrapping,
      apiError,
      currentUser,
      tenant,
      products,
      orders,
      adjustments,
      users,
      notifications,
      createOrderOpen,
      loadWorkspace,
      resetLocalState,
      addNotification,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

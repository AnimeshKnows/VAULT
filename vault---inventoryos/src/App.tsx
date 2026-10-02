import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Product,
  Order,
  StockAdjustment,
  UserAccount,
  Tenant,
  SystemNotification,
  OrderStatus,
  CurrentUserProfile,
} from './types';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NeuralCanvas } from './components/common/NeuralCanvas';
import { CinematicLanding } from './components/landing/CinematicLanding';
import { ShutterLogin } from './components/auth/ShutterLogin';
import { BuildingSignup } from './components/auth/BuildingSignup';
import { GuestOnly, RequireAuth } from './components/auth/RequireAuth';
import { DashboardView } from './components/dashboard/DashboardView';
import { OrdersView } from './components/orders/OrdersView';
import { ProductsView } from './components/products/ProductsView';
import { StockAdjustmentsView } from './components/adjustments/StockAdjustmentsView';
import { UsersView } from './components/users/UsersView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

import { CreateOrderModal } from './components/modals/CreateOrderModal';
import { ReorderDeficitModal } from './components/modals/ReorderDeficitModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { StockAdjustModal } from './components/modals/StockAdjustModal';

import { fetchCurrentUser, logout as apiLogout } from './lib/api/auth';
import {
  adjustProductStock,
  createOrder,
  createProduct,
  fetchOrders,
  fetchProducts,
  updateOrderStatus,
} from './lib/api/catalog';
import { fetchAuditLogs } from './lib/api/audit';
import { fetchUsers, createUser, deactivateUser } from './lib/api/users';
import { fetchCurrentTenant, updateCurrentTenant } from './lib/api/tenants';
import { ApiError } from './lib/api/client';
import { clearSession, getSessionUser, isAuthenticated } from './lib/auth/session';
import { isAuthenticatedPath, ROUTES } from './lib/routes';
import { useAppNavigation } from './hooks/useAppNavigation';

function mapTenant(dto: { id: string; name: string; isActive: boolean }, skuCount = 0): Tenant {
  return {
    id: dto.id,
    name: dto.name,
    code: dto.id.slice(0, 8).toUpperCase(),
    skuCount,
    isActive: dto.isActive,
  };
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentPage, onNavigate } = useAppNavigation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [landingScene, setLandingScene] = useState(0);
  const [shutterState, setShutterState] = useState<'default' | 'locked' | 'unlocked'>('locked');

  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [reorderDeficitOpen, setReorderDeficitOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [selectedProductToAdjust, setSelectedProductToAdjust] = useState<Product | null>(null);
  const workspaceHydrated = useRef(false);

  const addNotification = useCallback(
    (title: string, message: string, type: SystemNotification['type']) => {
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title,
        message,
        time: 'Just now',
        type,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const loadWorkspace = useCallback(async () => {
    if (!isAuthenticated()) return;
    setBootstrapping(true);
    setApiError(null);
    try {
      const [me, tenant, loadedProducts, loadedOrders, loadedAudit] = await Promise.all([
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
      setCurrentTenant(mapTenant(tenant, loadedProducts.length));
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
      const message =
        err instanceof ApiError ? err.message : 'Failed to load workspace from API';
      setApiError(message);
      addNotification('Load Failed', message, 'critical');
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        navigate(ROUTES.login, { replace: true });
      }
    } finally {
      setBootstrapping(false);
    }
  }, [addNotification, navigate]);

  useEffect(() => {
    if (!isAuthenticated() || !isAuthenticatedPath(location.pathname)) {
      if (!isAuthenticated()) {
        workspaceHydrated.current = false;
      }
      return;
    }
    if (workspaceHydrated.current) return;
    workspaceHydrated.current = true;
    void loadWorkspace();
  }, [location.pathname, loadWorkspace]);

  const enterAuthenticatedShell = async () => {
    workspaceHydrated.current = true;
    navigate(ROUTES.dashboard);
    await loadWorkspace();
  };

  const handleLogout = async () => {
    await apiLogout();
    clearSession();
    workspaceHydrated.current = false;
    setProducts([]);
    setOrders([]);
    setAdjustments([]);
    setUsers([]);
    setCurrentUser(null);
    setCurrentTenant(null);
    setNotifications([]);
    navigate(ROUTES.login, { replace: true });
  };

  const handleCreateOrder = async (draft: {
    customerName: string;
    customerEmail: string;
    items: { productId: string; quantity: number }[];
    confirmImmediately?: boolean;
  }) => {
    try {
      let created = await createOrder({
        customerName: draft.customerName,
        customerEmail: draft.customerEmail,
        items: draft.items,
      });

      if (draft.confirmImmediately) {
        created = await updateOrderStatus(created.id, 'Confirmed');
        setProducts(await fetchProducts());
      }

      setOrders((prev) => [created, ...prev]);
      addNotification(
        'Order Created',
        `Order ${created.orderNumber} for ${created.customerName} (₹${created.totalAmount.toLocaleString('en-IN')}).`,
        'success'
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Order create failed';
      addNotification('Order Failed', message, 'critical');
      throw err;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (newStatus === 'Confirmed' || newStatus === 'Cancelled') {
        setProducts(await fetchProducts());
      }
      addNotification(
        'Order Updated',
        `${updated.orderNumber} is now ${newStatus}.`,
        'info'
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Status update failed';
      addNotification('Status Update Failed', message, 'critical');
    }
  };

  const handleExecuteReorder = async (
    replenishments: { productId: string; addUnits: number }[]
  ) => {
    try {
      for (const rep of replenishments) {
        await adjustProductStock(
          rep.productId,
          rep.addUnits,
          'Automated deficit replenishment'
        );
      }
      setProducts(await fetchProducts());
      setAdjustments(await fetchAuditLogs());
      addNotification(
        'Replenishment Complete',
        `Restocked ${replenishments.length} items.`,
        'success'
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Reorder failed';
      addNotification('Reorder Failed', message, 'critical');
    }
  };

  const handleAddProduct = async (input: {
    name: string;
    sku: string;
    category: string;
    unitPrice: number;
    initialStock: number;
    threshold: number;
  }) => {
    try {
      const created = await createProduct({
        name: input.name,
        sku: input.sku,
        category: input.category,
        price: input.unitPrice,
        stock: input.initialStock,
        lowStockThreshold: input.threshold,
      });
      setProducts((prev) => [created, ...prev]);
      setCurrentTenant((prev) =>
        prev ? { ...prev, skuCount: prev.skuCount + 1 } : prev
      );
      addNotification(
        'Product Added',
        `${created.name} (${created.sku}) created.`,
        'info'
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Product create failed';
      addNotification('Product Failed', message, 'critical');
      throw err;
    }
  };

  const handleApplyStockAdjustment = async (
    productId: string,
    delta: number,
    reason: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    try {
      const updated = await adjustProductStock(productId, delta, reason);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      setAdjustments(await fetchAuditLogs());
      addNotification(
        'Stock Adjusted',
        `${updated.name} (${updated.sku}) ${delta > 0 ? `+${delta}` : delta}.`,
        delta > 0 ? 'success' : 'warning'
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Stock adjust failed';
      addNotification('Stock Adjust Failed', message, 'critical');
    }
  };

  const handleInviteUser = async (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'Admin' | 'Staff';
  }) => {
    const created = await createUser(input);
    setUsers((prev) => [...prev, created]);
    addNotification('Member Invited', `${created.name} added as ${created.role}.`, 'success');
  };

  const handleDeactivateUser = async (id: string) => {
    await deactivateUser(id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, activeStatus: 'Inactive' as const } : u))
    );
    addNotification('Member Deactivated', 'User access revoked.', 'warning');
  };

  const handleUpdateTenantName = async (newName: string) => {
    const updated = await updateCurrentTenant(newName);
    setCurrentTenant((prev) =>
      prev ? { ...prev, name: updated.name } : mapTenant(updated, products.length)
    );
    addNotification('Tenant Updated', `Workspace renamed to ${updated.name}.`, 'success');
  };

  const canvasMode =
    currentPage === 'landing'
      ? 'scrolling'
      : currentPage === 'login'
        ? shutterState
        : currentPage === 'signup'
          ? 'building'
          : 'default';

  const sessionRole = currentUser?.role ?? getSessionUser()?.role;
  const tenantForShell: Tenant = currentTenant ?? {
    id: 'loading',
    name: 'Loading…',
    code: '—',
    skuCount: 0,
    isActive: true,
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-[#dfe2ef] antialiased selection:bg-[#5356ff] selection:text-white font-sans relative overflow-x-hidden">
      <NeuralCanvas mode={canvasMode} sceneIndex={landingScene} />

      <Routes>
        <Route
          path={ROUTES.landing}
          element={
            <div className="relative z-10">
              <CinematicLanding
                onNavigate={onNavigate}
                onSceneChange={(sc) => setLandingScene(sc)}
                isLoggedIn={isAuthenticated()}
                userInitials={
                  (currentUser?.displayName || getSessionUser()?.email || 'IN')
                    .split(/\s+|[.@]/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase() ?? '')
                    .join('') || 'IN'
                }
              />
            </div>
          }
        />

        <Route
          path={ROUTES.login}
          element={
            <GuestOnly>
              <div className="relative z-10">
                <ShutterLogin
                  onSuccess={() => {
                    setShutterState('locked');
                    void enterAuthenticatedShell();
                  }}
                  onNavigate={onNavigate}
                  onStateChange={setShutterState}
                />
              </div>
            </GuestOnly>
          }
        />

        <Route
          path={ROUTES.signup}
          element={
            <GuestOnly>
              <div className="relative z-10">
                <BuildingSignup
                  onSuccess={(tenantId) => {
                    addNotification(
                      'Tenant Created',
                      `Workspace ready. Tenant ID ${tenantId}.`,
                      'success'
                    );
                    void enterAuthenticatedShell();
                  }}
                  onNavigate={onNavigate}
                />
              </div>
            </GuestOnly>
          }
        />

        <Route
          element={
            <RequireAuth>
              <div className="relative z-10 min-h-screen flex">
                <Sidebar
                  currentPage={currentPage}
                  onNavigate={onNavigate}
                  onLogout={() => void handleLogout()}
                  isOpenMobile={mobileMenuOpen}
                  onCloseMobile={() => setMobileMenuOpen(false)}
                />

                <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                  <Header
                    currentTenant={tenantForShell}
                    currentUser={currentUser}
                    notifications={notifications}
                    onClearNotification={(id) =>
                      setNotifications((prev) => prev.filter((n) => n.id !== id))
                    }
                    onOpenMobileMenu={() => setMobileMenuOpen(true)}
                    onLogout={() => void handleLogout()}
                    onNavigate={onNavigate}
                  />

                  <main className="relative pt-16 min-h-screen w-full px-4 sm:px-6 lg:px-8">
                    {bootstrapping && (
                      <div className="mb-4 mt-4 flex items-center gap-2 text-xs text-[#94A3B8]">
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#5356ff] border-t-transparent" />
                        Loading workspace…
                      </div>
                    )}
                    {apiError && !bootstrapping && (
                      <div className="mb-4 mt-4 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-xs font-mono text-[#EF4444]">
                        {apiError}
                      </div>
                    )}
                    <Outlet />
                  </main>
                </div>
              </div>
            </RequireAuth>
          }
        >
          <Route
            path={ROUTES.dashboard}
            element={
              <DashboardView
                products={products}
                orders={orders}
                onNavigate={onNavigate}
                onOpenReorderModal={() => setReorderDeficitOpen(true)}
                onSelectOrder={() => onNavigate('orders')}
                onRefresh={() => void loadWorkspace()}
              />
            }
          />
          <Route
            path={ROUTES.orders}
            element={
              <OrdersView
                orders={orders}
                onOpenCreateOrder={() => setCreateOrderOpen(true)}
                onUpdateOrderStatus={(id, status) => void handleUpdateOrderStatus(id, status)}
                canCancelOrders={sessionRole === 'Admin'}
              />
            }
          />
          <Route
            path={ROUTES.products}
            element={
              <ProductsView
                products={products}
                onOpenAddProduct={() => setAddProductOpen(true)}
                onOpenStockAdjust={(p) => setSelectedProductToAdjust(p)}
              />
            }
          />
          <Route
            path={ROUTES['stock-adjustments']}
            element={
              <StockAdjustmentsView
                adjustments={adjustments}
                onOpenNewAdjustment={() => {
                  if (products[0]) setSelectedProductToAdjust(products[0]);
                }}
              />
            }
          />
          <Route
            path={ROUTES.users}
            element={
              <UsersView
                users={users}
                onInviteUser={handleInviteUser}
                onDeactivateUser={handleDeactivateUser}
              />
            }
          />
          <Route path={ROUTES.reports} element={<ReportsView orders={orders} />} />
          <Route
            path={ROUTES.settings}
            element={
              <SettingsView
                currentTenant={tenantForShell}
                onUpdateTenantName={handleUpdateTenantName}
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
      </Routes>

      {createOrderOpen && (
        <CreateOrderModal
          products={products}
          onClose={() => setCreateOrderOpen(false)}
          onCreateOrder={async (payload) => {
            await handleCreateOrder(payload);
            setCreateOrderOpen(false);
          }}
        />
      )}

      {reorderDeficitOpen && (
        <ReorderDeficitModal
          products={products}
          onClose={() => setReorderDeficitOpen(false)}
          onExecuteReorder={(reps) => {
            void handleExecuteReorder(reps);
            setReorderDeficitOpen(false);
          }}
        />
      )}

      {addProductOpen && (
        <AddProductModal
          onClose={() => setAddProductOpen(false)}
          onAddProduct={async (payload) => {
            await handleAddProduct(payload);
            setAddProductOpen(false);
          }}
        />
      )}

      {selectedProductToAdjust && (
        <StockAdjustModal
          product={selectedProductToAdjust}
          onClose={() => setSelectedProductToAdjust(null)}
          onApplyAdjustment={(productId, delta, reason) => {
            void handleApplyStockAdjustment(productId, delta, reason).then(() =>
              setSelectedProductToAdjust(null)
            );
          }}
        />
      )}
    </div>
  );
}

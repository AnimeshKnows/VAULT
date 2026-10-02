import { useCallback, useEffect, useState } from 'react';
import {
  NavigationPage,
  Product,
  Order,
  StockAdjustment,
  UserAccount,
  Tenant,
  SystemNotification,
  OrderStatus,
} from './types';
import {
  INITIAL_ADJUSTMENTS,
  INITIAL_USERS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NeuralCanvas } from './components/common/NeuralCanvas';
import { CinematicLanding } from './components/landing/CinematicLanding';
import { ShutterLogin } from './components/auth/ShutterLogin';
import { BuildingSignup } from './components/auth/BuildingSignup';
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

import { logout as apiLogout } from './lib/api/auth';
import {
  adjustProductStock,
  createOrder,
  createProduct,
  fetchOrders,
  fetchProducts,
  updateOrderStatus,
} from './lib/api/catalog';
import { ApiError } from './lib/api/client';
import {
  clearSession,
  getSessionUser,
  getTenantId,
  isAuthenticated,
} from './lib/auth/session';

function tenantFromSession(): Tenant {
  const user = getSessionUser();
  const tenantId = getTenantId() ?? user?.tenantId ?? 'unknown';
  return {
    id: tenantId,
    name: user?.email ? `${user.email.split('@')[0]} workspace` : 'VAULT Tenant',
    code: tenantId.slice(0, 8).toUpperCase(),
    skuCount: 0,
    region: 'Connected API',
    ledgerNode: `VAULT-NODE // ${tenantId.slice(0, 8)}`,
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>(() =>
    isAuthenticated() ? 'dashboard' : 'landing'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [currentTenant, setCurrentTenant] = useState<Tenant>(() =>
    isAuthenticated() ? tenantFromSession() : tenantFromSession()
  );
  const [tenants, setTenants] = useState<Tenant[]>(() => [currentTenant]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(INITIAL_ADJUSTMENTS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [ledgerNumber, setLedgerNumber] = useState(819);
  const [landingScene, setLandingScene] = useState(0);
  const [shutterState, setShutterState] = useState<'default' | 'locked' | 'unlocked'>('locked');

  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [reorderDeficitOpen, setReorderDeficitOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [selectedProductToAdjust, setSelectedProductToAdjust] = useState<Product | null>(null);

  const addNotification = (
    title: string,
    message: string,
    type: SystemNotification['type']
  ) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      time: 'Just now',
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const loadWorkspace = useCallback(async () => {
    if (!isAuthenticated()) return;
    setBootstrapping(true);
    setApiError(null);
    try {
      const [loadedProducts, loadedOrders] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
      ]);
      setProducts(loadedProducts);
      setOrders(loadedOrders);
      const tenant = tenantFromSession();
      tenant.skuCount = loadedProducts.length;
      setCurrentTenant(tenant);
      setTenants([tenant]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Failed to load workspace from API';
      setApiError(message);
      addNotification('API Sync Failed', message, 'critical');
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        setCurrentPage('login');
      }
    } finally {
      setBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated() && currentPage === 'dashboard') {
      void loadWorkspace();
    }
  }, [currentPage, loadWorkspace]);

  const enterAuthenticatedShell = async () => {
    setCurrentTenant(tenantFromSession());
    setTenants([tenantFromSession()]);
    setCurrentPage('dashboard');
    await loadWorkspace();
  };

  const handleLogout = async () => {
    await apiLogout();
    clearSession();
    setProducts([]);
    setOrders([]);
    setCurrentPage('login');
    addNotification('Session Closed', 'Refresh token revoked and local session cleared.', 'info');
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
        const refreshedProducts = await fetchProducts();
        setProducts(refreshedProducts);
      }

      setOrders((prev) => [created, ...prev]);
      const nextLedger = ledgerNumber + 1;
      setLedgerNumber(nextLedger);
      addNotification(
        'Order Committed',
        `Order ${created.orderNumber} for ${created.customerName} (₹${created.totalAmount.toLocaleString('en-IN')}) signed as ${created.status}.`,
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
        'Order Status Changed',
        `${updated.orderNumber} status transitioned to "${newStatus}".`,
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
      const refreshed = await fetchProducts();
      setProducts(refreshed);

      const nextLedger = ledgerNumber + 1;
      setLedgerNumber(nextLedger);
      const newAdj: StockAdjustment = {
        id: `adj-${nextLedger}`,
        adjustmentNumber: `ADJ-2026-0${nextLedger}`,
        timestamp: `${new Date().toLocaleTimeString()} UTC`,
        sku: 'MULTI-REORDER',
        productName: `Bulk Inbound PO (${replenishments.length} SKUs)`,
        type: 'Reorder Arrival',
        delta: replenishments.reduce((a, b) => a + b.addUnits, 0),
        previousStock: 0,
        newStock: 0,
        reason: 'Automated deficit replenishment PO dispatch committed',
        operatorBadge: getSessionUser()?.email || 'API Operator',
        binLocation: 'Dock 1 Inbound',
        hash: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
      };
      setAdjustments((prev) => [newAdj, ...prev]);
      addNotification(
        'Automated Replenishment Confirmed',
        `Restocked ${replenishments.length} critical items via API stock adjust.`,
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
      setCurrentTenant((prev) => ({ ...prev, skuCount: prev.skuCount + 1 }));
      const nextLedger = ledgerNumber + 1;
      setLedgerNumber(nextLedger);
      addNotification(
        'New SKU Registered',
        `${created.name} (${created.sku}) created in tenant catalog.`,
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
      const previousStock = prod.currentStock;
      const updated = await adjustProductStock(productId, delta, reason);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));

      const nextLedger = ledgerNumber + 1;
      setLedgerNumber(nextLedger);
      const newAdj: StockAdjustment = {
        id: `adj-${nextLedger}`,
        adjustmentNumber: `ADJ-2026-0${nextLedger}`,
        timestamp: `${new Date().toLocaleTimeString()} UTC`,
        sku: updated.sku,
        productName: updated.name,
        type: delta > 0 ? 'Inbound Receipt' : 'Damage Write-off',
        delta,
        previousStock,
        newStock: updated.currentStock,
        reason,
        operatorBadge: getSessionUser()?.email || 'API Operator',
        binLocation: updated.warehouseBin || 'Zone Alpha // Bay 14-C',
        hash: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
      };
      setAdjustments((prev) => [newAdj, ...prev]);
      addNotification(
        'Stock Mutation Committed',
        `${updated.name} (${updated.sku}) delta ${delta > 0 ? `+${delta}` : delta} applied via API.`,
        delta > 0 ? 'success' : 'warning'
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Stock adjust failed';
      addNotification('Stock Adjust Failed', message, 'critical');
    }
  };

  const canvasMode =
    currentPage === 'landing'
      ? 'scrolling'
      : currentPage === 'login'
        ? shutterState
        : currentPage === 'signup'
          ? 'building'
          : 'default';

  return (
    <div className="min-h-screen bg-[#080B11] text-[#dfe2ef] antialiased selection:bg-[#5356ff] selection:text-white font-sans relative overflow-x-hidden">
      <NeuralCanvas mode={canvasMode} sceneIndex={landingScene} />

      {currentPage === 'landing' && (
        <div className="relative z-10">
          <CinematicLanding
            onNavigate={setCurrentPage}
            onSceneChange={(sc) => setLandingScene(sc)}
          />
        </div>
      )}

      {currentPage === 'login' && (
        <div className="relative z-10">
          <ShutterLogin
            onSuccess={() => {
              setShutterState('locked');
              void enterAuthenticatedShell();
            }}
            onNavigate={setCurrentPage}
            onStateChange={setShutterState}
          />
        </div>
      )}

      {currentPage === 'signup' && (
        <div className="relative z-10">
          <BuildingSignup
            onSuccess={(tenantId) => {
              addNotification(
                'Tenant Provisioned',
                `Workspace created. Tenant ID ${tenantId} saved for login.`,
                'success'
              );
              void enterAuthenticatedShell();
            }}
            onNavigate={setCurrentPage}
          />
        </div>
      )}

      {currentPage !== 'landing' && currentPage !== 'login' && currentPage !== 'signup' && (
        <div className="relative z-10 min-h-screen flex">
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            ledgerNumber={ledgerNumber}
          />

          <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
            <Header
              currentTenant={currentTenant}
              tenants={tenants}
              onSelectTenant={(t) => {
                setCurrentTenant(t);
                addNotification(
                  'Tenant Context',
                  `UI workspace shows "${t.name}". Multi-tenant switch requires re-login with that tenant's ID.`,
                  'info'
                );
              }}
              notifications={notifications}
              onClearNotification={(id) =>
                setNotifications((prev) => prev.filter((n) => n.id !== id))
              }
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              onLogout={() => void handleLogout()}
              onNavigate={setCurrentPage}
            />

            <main className="relative pt-16 min-h-screen w-full px-4 sm:px-6 lg:px-8">
              {(bootstrapping || apiError) && (
                <div
                  className={`mb-4 mt-4 rounded-xl border px-4 py-3 text-xs font-mono ${
                    apiError
                      ? 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
                      : 'border-[#82cfff]/30 bg-[#82cfff]/10 text-[#82cfff]'
                  }`}
                >
                  {bootstrapping ? 'Syncing products & orders from VAULT API…' : apiError}
                </div>
              )}

              {currentPage === 'dashboard' && (
                <DashboardView
                  products={products}
                  orders={orders}
                  onNavigate={setCurrentPage}
                  onOpenReorderModal={() => setReorderDeficitOpen(true)}
                  onSelectOrder={() => setCurrentPage('orders')}
                  ledgerNumber={ledgerNumber}
                />
              )}

              {currentPage === 'orders' && (
                <OrdersView
                  orders={orders}
                  onOpenCreateOrder={() => setCreateOrderOpen(true)}
                  onUpdateOrderStatus={(id, status) => void handleUpdateOrderStatus(id, status)}
                  canCancelOrders={getSessionUser()?.role === 'Admin'}
                />
              )}

              {currentPage === 'products' && (
                <ProductsView
                  products={products}
                  onOpenAddProduct={() => setAddProductOpen(true)}
                  onOpenStockAdjust={(p) => setSelectedProductToAdjust(p)}
                />
              )}

              {currentPage === 'stock-adjustments' && (
                <StockAdjustmentsView
                  adjustments={adjustments}
                  onOpenNewAdjustment={() => {
                    if (products[0]) setSelectedProductToAdjust(products[0]);
                  }}
                />
              )}

              {currentPage === 'users' && (
                <UsersView
                  users={users}
                  onAddUser={(newUser) => {
                    setUsers((prev) => [...prev, newUser]);
                    addNotification(
                      'Local Team Invite',
                      `${newUser.name} added in UI only — Users API is not implemented on the backend yet.`,
                      'warning'
                    );
                  }}
                />
              )}

              {currentPage === 'reports' && <ReportsView />}

              {currentPage === 'settings' && (
                <SettingsView
                  currentTenant={currentTenant}
                  onUpdateTenantName={(newName) => {
                    setCurrentTenant((prev) => ({ ...prev, name: newName }));
                    setTenants((prev) =>
                      prev.map((t) => (t.id === currentTenant.id ? { ...t, name: newName } : t))
                    );
                  }}
                />
              )}
            </main>
          </div>
        </div>
      )}

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

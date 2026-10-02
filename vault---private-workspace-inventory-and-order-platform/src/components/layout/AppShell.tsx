import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Sidebar, useSidebarCollapsedState } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileTabBar } from './MobileTabBar';
import { CommandPalette } from './CommandPalette';
import { PAGE_META, pageKeyFromPath, ROUTES } from '../../lib/routes';
import { apiLogout, getStoredUser } from '../../utils/auth';
import { clearAuthSession } from '../../utils/auth';
import { Modal } from '../ui';
import { prefersReducedMotion } from '../../lib/cn';
import { useWorkspaceOptional } from '../../context/workspaceContext';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workspace = useWorkspaceOptional();
  const { collapsed, onCollapsedChange } = useSidebarCollapsedState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const reduced = prefersReducedMotion();

  const stored = getStoredUser();
  const role = workspace?.currentUser?.role ?? stored?.role ?? 'Staff';
  const isAdmin = role === 'Admin';
  const workspaceName = workspace?.tenant?.name ?? 'Workspace';
  const userName =
    workspace?.currentUser?.displayName ||
    [stored?.firstName, stored?.lastName].filter(Boolean).join(' ') ||
    stored?.email ||
    'User';

  const pageKey = pageKeyFromPath(location.pathname);
  const title = pageKey ? PAGE_META[pageKey].title : 'Workspace';

  const unreadCount = workspace?.notifications.filter((n) => !n.read).length ?? 0;
  const products = workspace?.products ?? [];
  const orders = workspace?.orders ?? [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    await apiLogout();
    clearAuthSession();
    workspace?.resetLocalState();
    navigate(ROUTES.login, { replace: true });
  };

  const moreLinks = useMemo(
    () =>
      [
        { to: ROUTES.reports, label: 'Reports', icon: 'analytics' },
        { to: ROUTES.settings, label: 'Settings', icon: 'settings' },
        ...(isAdmin ? [{ to: ROUTES.users, label: 'Users', icon: 'group' }] : []),
      ] as const,
    [isAdmin]
  );

  return (
    <div className="vault-app min-h-screen">
      <Sidebar
        isAdmin={isAdmin}
        workspaceName={workspaceName}
        userName={userName}
        userRole={role}
        onLogout={() => void handleLogout()}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={collapsed}
        onCollapsedChange={onCollapsedChange}
      />

      <div
        className={
          collapsed ? 'lg:pl-[72px] flex flex-col min-h-screen' : 'lg:pl-64 flex flex-col min-h-screen'
        }
      >
        <TopBar
          title={title}
          unreadCount={unreadCount}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotifOpen(true)}
          onNewOrder={() => workspace?.openCreateOrder()}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main className="relative flex-1 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
          {workspace?.bootstrapping ? (
            <div className="mb-4 flex items-center gap-2 text-xs text-vault-secondary" role="status">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-vault-amber border-t-transparent" />
              Loading workspace…
            </div>
          ) : null}
          {workspace?.apiError && !workspace.bootstrapping ? (
            <div
              className="mb-4 rounded-xl border border-vault-danger/40 bg-vault-danger/10 px-4 py-3 text-xs font-mono text-vault-danger"
              role="alert"
            >
              {workspace.apiError}
              <button
                type="button"
                className="ml-3 underline"
                onClick={() => void workspace.loadWorkspace()}
              >
                Retry
              </button>
            </div>
          ) : null}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileTabBar isAdmin={isAdmin} onOpenMore={() => setMoreOpen(true)} />

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          unitPrice: p.unitPrice,
        }))}
        orders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          status: o.status,
        }))}
      />

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More" size="sm">
        <ul className="space-y-1">
          {moreLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-vault-text hover:bg-vault-raised"
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
        size="sm"
      >
        {(workspace?.notifications.length ?? 0) === 0 ? (
          <p className="text-sm text-vault-secondary">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {workspace!.notifications.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-vault-hairline bg-vault-raised/50 px-3 py-2"
              >
                <p className="text-sm font-semibold text-vault-text">{n.title}</p>
                <p className="text-xs text-vault-secondary mt-0.5">{n.message}</p>
                <p className="font-mono text-[10px] text-vault-muted mt-1">{n.time}</p>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
};

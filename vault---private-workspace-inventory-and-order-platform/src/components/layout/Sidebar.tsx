import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { Badge, IconButton } from '../ui';
import { cx } from '../../lib/cn';

const SIDEBAR_KEY = 'vault.sidebarCollapsed';

export interface SidebarProps {
  isAdmin: boolean;
  workspaceName: string;
  userName: string;
  userRole: string;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
}

const navItems: Array<{
  to: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}> = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: 'grid_view' },
  { to: ROUTES.products, label: 'Products', icon: 'inventory_2' },
  { to: ROUTES.orders, label: 'Orders', icon: 'receipt_long' },
  { to: ROUTES['stock-adjustments'], label: 'Stock Log', icon: 'tune' },
  { to: ROUTES.users, label: 'Users', icon: 'group', adminOnly: true },
  { to: ROUTES.reports, label: 'Reports', icon: 'analytics' },
  { to: ROUTES.settings, label: 'Settings', icon: 'settings' },
];

export function readSidebarCollapsed(): boolean {
  try {
    const raw = localStorage.getItem(SIDEBAR_KEY);
    if (raw === null) {
      return typeof window !== 'undefined' && window.innerWidth < 1024 && window.innerWidth >= 768;
    }
    return raw === '1';
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(value: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, value ? '1' : '0');
  } catch {
    // ignore quota / private mode
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  isAdmin,
  workspaceName,
  userName,
  userRole,
  onLogout,
  mobileOpen,
  onCloseMobile,
  collapsed,
  onCollapsedChange,
}) => {
  const navigate = useNavigate();
  const visible = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={cx(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-vault-hairline bg-vault-base transition-[width,transform] duration-200',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-vault-hairline px-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.landing)}
            className="flex min-w-0 items-center gap-2 vault-focus rounded-lg px-1 py-1"
            title="VAULT public site"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-vault-raised border border-vault-border font-mono text-[11px] font-bold text-vault-amber">
              V
            </span>
            {!collapsed ? (
              <span className="truncate font-semibold tracking-tight text-vault-text">VAULT</span>
            ) : null}
          </button>
          <IconButton
            label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:inline-flex"
            onClick={() => onCollapsedChange(!collapsed)}
          >
            <span className="material-symbols-outlined text-[18px]">
              {collapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
            </span>
          </IconButton>
          <IconButton label="Close menu" className="lg:hidden" onClick={onCloseMobile}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </IconButton>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3" aria-label="Workspace">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              title={item.label}
              className={({ isActive }) =>
                cx(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors vault-focus',
                  isActive
                    ? 'bg-vault-raised text-vault-text border-l-2 border-vault-amber'
                    : 'text-vault-secondary hover:bg-vault-raised/70 hover:text-vault-text border-l-2 border-transparent'
                )
              }
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-vault-hairline p-3 space-y-2">
          {!collapsed ? (
            <div className="rounded-xl bg-vault-surface border border-vault-hairline px-3 py-2.5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-vault-muted">Workspace</p>
              <p className="mt-1 truncate text-sm font-semibold text-vault-text">{workspaceName}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs text-vault-secondary">{userName}</p>
                </div>
                <Badge tone={userRole === 'Admin' ? 'amber' : 'neutral'}>{userRole}</Badge>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            className={cx(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-vault-secondary hover:bg-vault-raised hover:text-vault-danger transition-colors vault-focus',
              collapsed && 'justify-center'
            )}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!collapsed ? <span>Log out</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
};

export function useSidebarCollapsedState() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(readSidebarCollapsed());
  }, []);

  const onCollapsedChange = (value: boolean) => {
    setCollapsed(value);
    writeSidebarCollapsed(value);
  };

  return { collapsed, onCollapsedChange };
}

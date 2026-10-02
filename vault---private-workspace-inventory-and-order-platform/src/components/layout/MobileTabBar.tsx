import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { cx } from '../../lib/cn';

export interface MobileTabBarProps {
  isAdmin: boolean;
  onOpenMore: () => void;
}

const primaryTabs = [
  { to: ROUTES.dashboard, label: 'Home', icon: 'grid_view' },
  { to: ROUTES.products, label: 'Products', icon: 'inventory_2' },
  { to: ROUTES.orders, label: 'Orders', icon: 'receipt_long' },
  { to: ROUTES['stock-adjustments'], label: 'Stock', icon: 'tune' },
] as const;

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ onOpenMore }) => (
  <nav
    className="fixed bottom-0 inset-x-0 z-40 flex border-t border-vault-hairline bg-vault-base/95 backdrop-blur md:hidden"
    aria-label="Primary"
  >
    {primaryTabs.map((tab) => (
      <NavLink
        key={tab.to}
        to={tab.to}
        className={({ isActive }) =>
          cx(
            'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-mono uppercase tracking-wider',
            isActive ? 'text-vault-amber' : 'text-vault-secondary'
          )
        }
      >
        <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
        {tab.label}
      </NavLink>
    ))}
    <button
      type="button"
      onClick={onOpenMore}
      className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-mono uppercase tracking-wider text-vault-secondary"
    >
      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
      More
    </button>
  </nav>
);

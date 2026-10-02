import React from 'react';
import { Button, IconButton } from '../ui';
import { cx } from '../../lib/cn';

export interface TopBarProps {
  title: string;
  unreadCount: number;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onNewOrder: () => void;
  onOpenMobileMenu: () => void;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  unreadCount,
  onOpenSearch,
  onOpenNotifications,
  onNewOrder,
  onOpenMobileMenu,
  className,
}) => (
  <header
    className={cx(
      'sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-vault-hairline bg-vault-base/90 px-4 backdrop-blur sm:px-6',
      className
    )}
  >
    <div className="flex min-w-0 items-center gap-2">
      <IconButton label="Open menu" className="lg:hidden" onClick={onOpenMobileMenu}>
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </IconButton>
      <h1 className="truncate text-sm font-semibold tracking-tight text-vault-text sm:text-base">
        {title}
      </h1>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden sm:flex items-center gap-2 rounded-full border border-vault-hairline bg-vault-surface px-3 py-1.5 text-xs text-vault-secondary hover:border-vault-border vault-focus"
      >
        <span className="material-symbols-outlined text-[16px]">search</span>
        <span>Search</span>
        <kbd className="ml-2 rounded bg-vault-raised px-1.5 py-0.5 font-mono text-[10px] text-vault-muted">
          ⌘K
        </kbd>
      </button>
      <IconButton label="Search" className="sm:hidden" onClick={onOpenSearch}>
        <span className="material-symbols-outlined text-[18px]">search</span>
      </IconButton>

      <div className="relative">
        <IconButton label="Notifications" onClick={onOpenNotifications}>
          <span className="material-symbols-outlined text-[18px]">notifications</span>
        </IconButton>
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-vault-amber px-1 font-mono text-[9px] font-bold text-vault-base">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </div>

      <Button type="button" size="sm" onClick={onNewOrder} className="hidden sm:inline-flex">
        New order
      </Button>
      <IconButton label="New order" className="sm:hidden" onClick={onNewOrder}>
        <span className="material-symbols-outlined text-[18px]">add</span>
      </IconButton>
    </div>
  </header>
);

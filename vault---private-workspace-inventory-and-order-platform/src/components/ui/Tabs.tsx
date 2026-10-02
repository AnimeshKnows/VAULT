import React from 'react';
import { cx } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, value, onChange, className }) => (
  <div
    role="tablist"
    aria-label="Filters"
    className={cx('flex flex-wrap gap-1 border-b border-vault-hairline', className)}
  >
    {items.map((item) => {
      const active = item.id === value;
      return (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(item.id)}
          className={cx(
            'px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors vault-focus rounded-t-md',
            active
              ? 'text-vault-amber border-b-2 border-vault-amber'
              : 'text-vault-secondary hover:text-vault-text border-b-2 border-transparent'
          )}
        >
          {item.label}
          {typeof item.count === 'number' ? (
            <span className="ml-1.5 tabular-nums text-vault-muted">({item.count})</span>
          ) : null}
        </button>
      );
    })}
  </div>
);

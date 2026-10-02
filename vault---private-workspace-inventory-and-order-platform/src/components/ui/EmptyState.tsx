import React from 'react';
import { Button } from './Button';
import { cx } from '../../lib/cn';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => (
  <div
    className={cx(
      'flex flex-col items-center justify-center text-center gap-3 py-12 px-6 rounded-2xl border border-dashed border-vault-border bg-vault-surface/50',
      className
    )}
  >
    <span className="material-symbols-outlined text-[32px] text-vault-muted" aria-hidden>
      {icon}
    </span>
    <h3 className="text-base font-semibold text-vault-text">{title}</h3>
    {description ? <p className="text-sm text-vault-secondary max-w-md">{description}</p> : null}
    {actionLabel && onAction ? (
      <Button type="button" size="sm" onClick={onAction} className="mt-2">
        {actionLabel}
      </Button>
    ) : null}
  </div>
);

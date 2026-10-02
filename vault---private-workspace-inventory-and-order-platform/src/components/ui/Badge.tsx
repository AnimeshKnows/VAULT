import React from 'react';
import { cx } from '../../lib/cn';

export type BadgeTone = 'neutral' | 'amber' | 'success' | 'info' | 'danger';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneMap: Record<BadgeTone, string> = {
  neutral: 'border-vault-border text-vault-secondary bg-vault-raised',
  amber: 'border-vault-amber/40 text-vault-amber bg-vault-amber/10',
  success: 'border-vault-success/40 text-vault-success bg-vault-success/10',
  info: 'border-vault-info/40 text-vault-info bg-vault-info/10',
  danger: 'border-vault-danger/40 text-vault-danger bg-vault-danger/10',
};

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'neutral', className }) => (
  <span
    className={cx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-mono text-[10px] uppercase tracking-wider font-semibold',
      toneMap[tone],
      className
    )}
  >
    {children}
  </span>
);

import React from 'react';
import { cx } from '../../lib/cn';

export interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const radius = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-2xl',
  full: 'rounded-full',
} as const;

export const Skeleton: React.FC<SkeletonProps> = ({ className, rounded = 'md' }) => (
  <div
    aria-hidden
    className={cx('vault-skeleton', radius[rounded], className)}
  />
);

export const SkeletonRows: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="space-y-2" role="status" aria-label="Loading">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((__, c) => (
          <Skeleton key={c} className="h-8" />
        ))}
      </div>
    ))}
  </div>
);

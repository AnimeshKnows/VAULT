import React from 'react';
import { cx } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
} as const;

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  className,
  children,
  ...rest
}) => (
  <div
    className={cx(
      'rounded-2xl bg-vault-surface border border-vault-hairline',
      paddingMap[padding],
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

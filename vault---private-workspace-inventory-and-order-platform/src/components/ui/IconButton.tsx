import React from 'react';
import { cx } from '../../lib/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, active = false, className, children, type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-120 vault-focus',
        active
          ? 'bg-vault-raised border-vault-border text-vault-amber'
          : 'bg-transparent border-vault-hairline text-vault-secondary hover:bg-vault-raised hover:text-vault-text',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
);
IconButton.displayName = 'IconButton';

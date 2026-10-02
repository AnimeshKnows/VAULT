import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cx } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  withArrow?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 pl-4 pr-1.5 text-[11px] gap-2',
  md: 'h-11 pl-5 pr-2 text-xs gap-3',
  lg: 'h-12 pl-6 pr-2 text-[13px] gap-4',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-vault-amber text-vault-base border border-vault-amber hover:brightness-110',
  secondary:
    'bg-transparent text-vault-text border border-vault-border hover:bg-vault-raised',
  ghost:
    'bg-transparent text-vault-secondary border border-transparent hover:bg-vault-raised hover:text-vault-text',
  danger:
    'bg-transparent text-vault-danger border border-vault-danger/40 hover:bg-vault-danger/10',
};

const chipClasses: Record<ButtonVariant, string> = {
  primary: 'bg-vault-base text-vault-amber group-hover:translate-x-0.5',
  secondary: 'bg-vault-raised text-vault-text group-hover:bg-vault-amber group-hover:text-vault-base',
  ghost: 'bg-vault-raised text-vault-secondary group-hover:text-vault-text',
  danger: 'bg-vault-danger/20 text-vault-danger',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      withArrow = true,
      className,
      children,
      disabled,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cx(
          'group inline-flex items-center justify-between rounded-full font-mono uppercase tracking-wider font-semibold transition-[transform,opacity,background-color,border-color,filter] duration-200 select-none vault-focus',
          sizeClasses[size],
          variantClasses[variant],
          isDisabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...rest}
      >
        <span className="truncate">{loading ? 'Working…' : children}</span>
        {withArrow && (
          <span
            className={cx(
              'w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] flex items-center justify-center shrink-0 transition-transform duration-200',
              chipClasses[variant]
            )}
          >
            <ArrowUpRight className="w-4 h-4" aria-hidden />
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

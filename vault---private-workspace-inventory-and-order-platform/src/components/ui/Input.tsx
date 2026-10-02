import React from 'react';
import { cx } from '../../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
    return (
      <label className="block space-y-1.5">
        {label ? (
          <span className="block font-mono text-[10px] uppercase tracking-wider text-vault-secondary">
            {label}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cx(
            'w-full h-10 px-3 rounded-lg bg-vault-raised border text-sm text-vault-text placeholder:text-vault-muted vault-focus transition-colors',
            error ? 'border-vault-danger' : 'border-vault-hairline focus:border-vault-amber',
            className
          )}
          {...rest}
        />
        {error ? (
          <span id={describedBy} className="block text-xs text-vault-danger" role="alert">
            {error}
          </span>
        ) : hint ? (
          <span id={describedBy} className="block text-xs text-vault-muted">
            {hint}
          </span>
        ) : null}
      </label>
    );
  }
);
Input.displayName = 'Input';

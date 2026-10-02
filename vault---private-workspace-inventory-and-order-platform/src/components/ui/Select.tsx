import React from 'react';
import { cx } from '../../lib/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, id, className, options, ...rest }, ref) => {
    const selectId = id ?? rest.name;
    const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;
    return (
      <label className="block space-y-1.5">
        {label ? (
          <span className="block font-mono text-[10px] uppercase tracking-wider text-vault-secondary">
            {label}
          </span>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cx(
            'w-full h-10 px-3 rounded-lg bg-vault-raised border text-sm text-vault-text vault-focus transition-colors',
            error ? 'border-vault-danger' : 'border-vault-hairline focus:border-vault-amber',
            className
          )}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
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
Select.displayName = 'Select';

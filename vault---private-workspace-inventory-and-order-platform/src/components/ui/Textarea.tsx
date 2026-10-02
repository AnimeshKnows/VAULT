import React from 'react';
import { cx } from '../../lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, id, className, ...rest }, ref) => {
    const areaId = id ?? rest.name;
    const describedBy = error ? `${areaId}-error` : hint ? `${areaId}-hint` : undefined;
    return (
      <label className="block space-y-1.5">
        {label ? (
          <span className="block font-mono text-[10px] uppercase tracking-wider text-vault-secondary">
            {label}
          </span>
        ) : null}
        <textarea
          ref={ref}
          id={areaId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cx(
            'w-full min-h-[96px] px-3 py-2 rounded-lg bg-vault-raised border text-sm text-vault-text placeholder:text-vault-muted vault-focus transition-colors resize-y',
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
Textarea.displayName = 'Textarea';

import React from 'react';
import { cx } from '../../lib/cn';

export interface SectionTagProps {
  index: string;
  label: string;
  className?: string;
}

/** App-edition section tag: `[S.01] OVERVIEW` */
export const SectionTag: React.FC<SectionTagProps> = ({ index, label, className }) => {
  const formatted = index.startsWith('[') ? index : `[${index}]`;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider select-none',
        className
      )}
    >
      <span className="px-2 py-0.5 rounded-[3px] border border-vault-border text-vault-secondary bg-vault-raised/80">
        {formatted}
      </span>
      <span className="px-2 py-0.5 rounded-[3px] bg-vault-amber text-vault-base font-bold">
        {label}
      </span>
    </span>
  );
};

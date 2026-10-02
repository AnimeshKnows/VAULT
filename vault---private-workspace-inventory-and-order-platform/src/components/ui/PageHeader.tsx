import React from 'react';
import { SectionTag } from './SectionTag';
import { cx } from '../../lib/cn';

export interface PageHeaderProps {
  index: string;
  label: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  index,
  label,
  title,
  description,
  actions,
  className,
}) => (
  <div
    className={cx(
      'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6',
      className
    )}
  >
    <div className="min-w-0">
      <SectionTag index={index} label={label} />
      <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-vault-text leading-[1.15]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-vault-secondary max-w-2xl">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
  </div>
);

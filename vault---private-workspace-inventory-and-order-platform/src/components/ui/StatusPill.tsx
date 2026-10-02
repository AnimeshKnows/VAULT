import React from 'react';
import { Badge, type BadgeTone } from './Badge';
import { cx } from '../../lib/cn';

export interface StatusPillProps {
  label: string;
  tone?: BadgeTone;
  icon?: string;
  className?: string;
}

/** Status always pairs color with a text label (and optional Material Symbol). */
export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  tone = 'neutral',
  icon,
  className,
}) => (
  <Badge tone={tone} className={cx('gap-1.5', className)}>
    {icon ? (
      <span className="material-symbols-outlined text-[14px] leading-none" aria-hidden>
        {icon}
      </span>
    ) : null}
    <span>{label}</span>
  </Badge>
);

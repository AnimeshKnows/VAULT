import React, { useEffect, useRef, useState } from 'react';
import { Card } from './Card';
import { formatNumber } from '../../lib/format';
import { cx, prefersReducedMotion } from '../../lib/cn';

export interface StatProps {
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
  className?: string;
  animate?: boolean;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  suffix,
  hint,
  className,
  animate = true,
}) => {
  const [display, setDisplay] = useState(animate ? 0 : value);
  const seen = useRef(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!animate || reduced || seen.current) {
      setDisplay(value);
      return;
    }
    seen.current = true;
    const start = performance.now();
    const duration = 700;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, reduced, value]);

  return (
    <Card className={cx('min-w-0', className)}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-vault-secondary">{label}</p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold text-vault-amber tabular-nums tracking-tight">
        {formatNumber(display)}
        {suffix ? <span className="text-base text-vault-secondary ml-1">{suffix}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-xs text-vault-muted">{hint}</p> : null}
    </Card>
  );
};

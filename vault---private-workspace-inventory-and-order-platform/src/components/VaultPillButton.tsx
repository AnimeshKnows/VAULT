import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface VaultPillButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'dark' | 'light';
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Unified VAULT button component:
 * A pill with a mono uppercase label and a square chip on the right.
 * On dark sections, the pill is white with a dark chip.
 * On light sections, the pill is dark with a white chip.
 */
export const VaultPillButton: React.FC<VaultPillButtonProps> = ({
  label,
  onClick,
  href,
  variant = 'dark',
  className = '',
  ariaLabel,
  type = 'button',
}) => {
  const isLight = variant === 'light';

  const baseStyles = `
    inline-flex items-center justify-between gap-3 sm:gap-4
    h-11 sm:h-12 pl-5 sm:pl-6 pr-2 rounded-full
    font-mono text-xs sm:text-[13px] uppercase tracking-wider font-semibold
    transition-all duration-200 select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB020]
  `;

  const themeStyles = isLight
    ? 'bg-white text-[#141414] hover:bg-neutral-100 shadow-sm border border-black/10'
    : 'bg-[#141414] text-white hover:bg-neutral-900 border border-neutral-700/50';

  const chipStyles = isLight
    ? 'bg-[#141414] text-white group-hover:bg-[#FFB020] group-hover:text-[#141414]'
    : 'bg-white text-[#141414] group-hover:bg-[#FFB020] group-hover:text-[#141414]';

  const content = (
    <>
      <span className="truncate">{label}</span>
      <span
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] flex items-center justify-center transition-colors duration-200 shrink-0 ${chipStyles}`}
      >
        <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${baseStyles} ${themeStyles} ${className}`}
        aria-label={ariaLabel || label}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${themeStyles} ${className}`}
      aria-label={ariaLabel || label}
    >
      {content}
    </button>
  );
};

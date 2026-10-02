import React from 'react';

interface SectionTagProps {
  index: string; // e.g. "S.02" or "[S.02]"
  label: string; // e.g. "CAPABILITIES"
  theme?: 'dark' | 'light';
  className?: string;
  inline?: boolean;
}

export const SectionTag: React.FC<SectionTagProps> = ({
  index,
  label,
  theme = 'light',
  className = '',
  inline = false,
}) => {
  const formattedIndex = index.startsWith('[') ? index : `[${index}]`;

  const isDark = theme === 'dark';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider select-none ${
        inline ? 'mr-3 align-middle' : 'mb-6 sm:mb-8'
      } ${className}`}
    >
      <span
        className={`px-2 py-0.5 rounded-[3px] border ${
          isDark
            ? 'border-neutral-700 text-neutral-300 bg-neutral-900/60'
            : 'border-neutral-400 text-neutral-700 bg-white/70'
        }`}
      >
        {formattedIndex}
      </span>
      <span
        className={`px-2 py-0.5 rounded-[3px] font-bold ${
          isDark
            ? 'bg-white text-[#141414]'
            : 'bg-[#141414] text-white'
        }`}
      >
        {label}
      </span>
    </span>
  );
};

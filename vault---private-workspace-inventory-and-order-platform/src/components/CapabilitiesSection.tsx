import React, { useState } from 'react';
import { Package, ShoppingCart, Lock, Users, FileBarChart, History, X } from 'lucide-react';
import { SectionTag } from './SectionTag';
import { VaultPillButton } from './VaultPillButton';
import { FadeRise, StaggerCard } from './MotionWrappers';
import { ScrollWordReveal } from './ScrollWordReveal';

interface CapabilityCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tag: string;
  index: number;
}

const CapabilityCard: React.FC<CapabilityCardProps> = ({
  icon: Icon,
  title,
  description,
  tag,
  index,
}) => {
  const [isTapped, setIsTapped] = useState(false);

  return (
    <StaggerCard index={index}>
      <div
        onClick={() => setIsTapped(!isTapped)}
        className={`group relative h-72 sm:h-80 p-6 sm:p-7 rounded-xl border border-neutral-300 transition-all duration-250 cursor-pointer select-none flex flex-col justify-between overflow-hidden ${
          isTapped
            ? 'bg-[#FFB020] border-[#FFB020] shadow-lg'
            : 'bg-white hover:bg-[#FFB020] hover:border-[#FFB020]'
        }`}
      >
        {/* Top row: Line icon top-left, mono index top-right */}
        <div className="flex items-center justify-between relative z-10">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-250 ${
              isTapped
                ? 'bg-[#141414] text-white'
                : 'bg-neutral-100 text-neutral-800 group-hover:bg-[#141414] group-hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 stroke-[1.75]" />
          </div>
          <span
            className={`font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors duration-250 ${
              isTapped ? 'text-[#141414]' : 'text-neutral-500 group-hover:text-[#141414]'
            }`}
          >
            {tag}
          </span>
        </div>

        {/* Bottom Area: Bold title bottom-left, description slides up on hover/tap */}
        <div className="relative z-10">
          <h3
            className={`font-sans font-bold text-xl sm:text-2xl tracking-tight transition-colors duration-250 ${
              isTapped ? 'text-[#141414]' : 'text-[#141414] group-hover:text-[#141414]'
            }`}
          >
            {title}
          </h3>

          {/* Short description slides up */}
          <div
            className={`transition-all duration-250 ease-out overflow-hidden ${
              isTapped
                ? 'max-h-32 opacity-100 mt-2.5'
                : 'max-h-0 opacity-0 mt-0 group-hover:max-h-32 group-hover:opacity-100 group-hover:mt-2.5'
            }`}
          >
            <p className="text-xs sm:text-[13px] font-sans font-medium text-[#141414]/90 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </StaggerCard>
  );
};

export const CapabilitiesSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const capabilities = [
    {
      icon: Package,
      title: 'Products and Stock',
      description: 'Keep every SKU, price and stock level in one place, with low-stock alerts.',
      tag: '01 / CATALOG',
    },
    {
      icon: ShoppingCart,
      title: 'Orders',
      description: 'Take orders and move them from draft to confirmed to fulfilled.',
      tag: '02 / PIPELINE',
    },
    {
      icon: Lock,
      title: 'Reliable Stock',
      description: 'Stock is reserved only when an order is confirmed, so you never sell what you do not have.',
      tag: '03 / ACCURACY',
    },
    {
      icon: Users,
      title: 'Team Access',
      description: 'Give Admins full control and Staff the tools they need.',
      tag: '04 / ROLES',
    },
    {
      icon: FileBarChart,
      title: 'Reports',
      description: 'See sales, order volume and stock value at a glance.',
      tag: '05 / INSIGHTS',
    },
    {
      icon: History,
      title: 'Activity History',
      description: 'Every stock change is recorded.',
      tag: '06 / HISTORY',
    },
  ];

  return (
    <section
      id="capabilities"
      data-theme="light"
      className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-12 bg-[#ECEFEC] text-[#141414]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Large editorial statement with the CAPABILITIES tag inline and scroll-linked text blackening */}
        <div className="mb-12 sm:mb-16 max-w-5xl">
          <ScrollWordReveal
            text="Track stock, take orders and control who can do what, without leaking a single row across companies."
            prefixElement={<SectionTag index="S.02" label="CAPABILITIES" theme="light" inline />}
            className="font-sans font-bold text-2xl sm:text-4xl md:text-5xl lg:text-[46px] tracking-tight leading-[1.12]"
            theme="light"
            as="h2"
          />
        </div>

        {/* 3-column grid of 6 cards: plain benefit language, amber hover fill */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {capabilities.map((cap, i) => (
            <CapabilityCard
              key={i}
              index={i}
              icon={cap.icon}
              title={cap.title}
              description={cap.description}
              tag={cap.tag}
            />
          ))}
        </div>

        {/* Bottom row: "SEE MORE" pill sits bottom-right of the grid */}
        <FadeRise delay={0.2} className="mt-8 sm:mt-10 flex justify-end">
          <VaultPillButton
            label="SEE MORE"
            variant="dark"
            onClick={() => setModalOpen(true)}
          />
        </FadeRise>
      </div>

      {/* Modal for "SEE MORE" capabilities overview */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-white space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#FFB020] uppercase tracking-widest">
                  PLATFORM OVERVIEW
                </span>
                <h3 className="font-sans font-bold text-2xl tracking-tight mt-0.5">
                  Designed for Day-to-Day Operations
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 font-sans text-sm text-neutral-300 leading-relaxed">
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="font-mono text-xs font-bold text-white mb-1">
                  Products and Stock
                </div>
                <p className="text-xs text-neutral-400">
                  Keep every SKU, price and stock level in one place. Receive timely alerts when items drop below your defined minimum thresholds.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="font-mono text-xs font-bold text-white mb-1">
                  Reliable Stock Allocation
                </div>
                <p className="text-xs text-neutral-400">
                  Stock is checked as soon as an order is prepared, and committed when confirmed. You avoid double-selling and maintain accurate counts.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="font-mono text-xs font-bold text-white mb-1">
                  Team Roles &amp; History
                </div>
                <p className="text-xs text-neutral-400">
                  Admins configure settings and oversee operations; Staff handle order fulfillment and stock counts. Every adjustment is logged with full history.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 rounded-full bg-white text-[#141414] font-mono text-xs uppercase font-bold tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

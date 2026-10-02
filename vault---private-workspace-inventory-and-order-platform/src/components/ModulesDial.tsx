import React, { useState, useEffect, useRef } from 'react';
import { SectionTag } from './SectionTag';
import { ProductsMockup, OrdersTableMockup, UsersRbacMockup, ReportsMockup, HistoryMockup } from './UiScreenshots';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { FadeRise } from './MotionWrappers';

interface ModuleItem {
  id: string;
  name: string;
  code: string;
  subtitle: string;
}

export const ModulesDial: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const modules: ModuleItem[] = [
    { id: 'products', name: 'Products', code: 'PRODUCTS [#01]', subtitle: 'SKU catalog, prices and stock alerts' },
    { id: 'orders', name: 'Orders', code: 'ORDERS [#02]', subtitle: 'Draft, confirmed and fulfilled flow' },
    { id: 'users', name: 'Users', code: 'USERS [#03]', subtitle: 'Admin and staff workspace roles' },
    { id: 'reports', name: 'Reports', code: 'REPORTS [#04]', subtitle: 'Sales, order volume and stock value' },
    { id: 'history', name: 'History', code: 'HISTORY [#05]', subtitle: 'Recorded stock changes and adjustments' },
  ];

  // Scroll spy to advance dial when scrolling through the section
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const progress = Math.min(Math.max((windowHeight * 0.5 - rect.top) / rect.height, 0), 1);
      const nextIndex = Math.min(Math.floor(progress * modules.length), modules.length - 1);
      
      if (nextIndex >= 0 && nextIndex < modules.length) {
        setActiveIndex(nextIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [modules.length]);

  const currentModule = modules[activeIndex];
  const dialRotation = activeIndex * (360 / modules.length);

  return (
    <section
      id="modules"
      data-theme="light"
      ref={containerRef}
      className="relative w-full py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-[#ECEFEC] text-[#141414] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <FadeRise>
          <SectionTag index="S.03" label="MODULES" theme="light" />
        </FadeRise>

        {/* Section title */}
        <FadeRise delay={0.1} className="mb-14 sm:mb-20 max-w-3xl">
          <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#141414]">
            Five core tools in your workspace.
          </h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 uppercase tracking-wider mt-3">
            BUILT FOR STRAIGHTFORWARD INVENTORY AND ORDER MANAGEMENT.
          </p>
        </FadeRise>

        {/* Dial Layout: Left list, Center visual with radial tick dial, Right mono code */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Vertical List of modules */}
          <div className="lg:col-span-3 space-y-4">
            <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-3">
              SELECT MODULE
            </div>
            <ul className="space-y-3" role="tablist">
              {modules.map((mod, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={mod.id}>
                    <button
                      onClick={() => setActiveIndex(index)}
                      role="tab"
                      aria-selected={isActive}
                      className={`text-left w-full transition-all duration-300 py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFB020] rounded cursor-pointer ${
                        isActive
                          ? 'text-[#141414] font-extrabold translate-x-2'
                          : 'text-neutral-500 hover:text-neutral-800 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono text-xs transition-colors ${
                            isActive ? 'text-[#FFB020]' : 'text-neutral-500'
                          }`}
                        >
                          0{index + 1}
                        </span>
                        <span className="font-sans text-2xl sm:text-3xl tracking-tight leading-none">
                          {mod.name}
                        </span>
                      </div>
                      {isActive && (
                        <div className="font-mono text-[11px] text-neutral-600 mt-1 pl-7">
                          {mod.subtitle}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Quick advance stepper */}
            <div className="pt-6 border-t border-neutral-300 flex items-center gap-2">
              <button
                onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : modules.length - 1))}
                className="w-8 h-8 rounded-full border border-neutral-400 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-800 transition-colors cursor-pointer"
                aria-label="Previous module"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveIndex((prev) => (prev < modules.length - 1 ? prev + 1 : 0))}
                className="w-8 h-8 rounded-full border border-neutral-400 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-800 transition-colors cursor-pointer"
                aria-label="Next module"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <span className="font-mono text-[10px] text-neutral-500 ml-2">
                SCROLL OR STEP THROUGH MODULES
              </span>
            </div>
          </div>

          {/* Center: Dial Ring with radial tick marks + Center visual on clean background */}
          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[460px] sm:min-h-[500px]">
            {/* Radial Dial Ring SVG */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <svg
                className="w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${dialRotation}deg)` }}
                viewBox="0 0 500 500"
              >
                {/* Outer guide circle */}
                <circle
                  cx="250"
                  cy="250"
                  r="230"
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                {/* Radial tick marks */}
                {Array.from({ length: 72 }).map((_, i) => {
                  const angle = (i * 360) / 72;
                  const isMajor = i % 6 === 0;
                  const length = isMajor ? 14 : 7;
                  const r1 = 230;
                  const r2 = 230 - length;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 250 + r1 * Math.cos(rad);
                  const y1 = 250 + r1 * Math.sin(rad);
                  const x2 = 250 + r2 * Math.cos(rad);
                  const y2 = 250 + r2 * Math.sin(rad);

                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isMajor ? '#141414' : '#9CA3AF'}
                      strokeWidth={isMajor ? 2 : 1}
                    />
                  );
                })}
                {/* Amber indicator notch at the top */}
                <circle cx="250" cy="20" r="5" fill="#FFB020" />
              </svg>
            </div>

            {/* Clean Center Visual (No harsh visible rectangle) */}
            <div className="relative z-10 w-full max-w-[420px] transition-all duration-300 transform scale-100">
              {activeIndex === 0 && <ProductsMockup />}
              {activeIndex === 1 && <OrdersTableMockup />}
              {activeIndex === 2 && <UsersRbacMockup />}
              {activeIndex === 3 && <ReportsMockup />}
              {activeIndex === 4 && <HistoryMockup />}
            </div>
          </div>

          {/* Right: Mono label with module code */}
          <div className="lg:col-span-3 lg:text-right">
            <div className="inline-block p-4 sm:p-5 rounded-xl bg-white border border-neutral-300 shadow-sm text-left lg:text-right">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">
                ACTIVE WORKSPACE VIEW
              </span>
              <div className="font-mono text-sm sm:text-base font-bold text-[#141414] mt-1 tracking-wider">
                {currentModule.code}
              </div>
              <p className="font-mono text-[11px] text-neutral-600 mt-2 leading-relaxed">
                Fully isolated workspace view. Accessible only by authorized team members in your company.
              </p>
              <div className="mt-4 pt-3 border-t border-neutral-200 font-mono text-[10px] text-[#FFB020] font-semibold flex items-center justify-end gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020]" />
                PRIVATE WORKSPACE
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

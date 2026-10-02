import React, { useState, useEffect, useRef } from 'react';
import { SectionTag } from './SectionTag';
import { FadeRise } from './MotionWrappers';
import { ScrollWordReveal } from './ScrollWordReveal';
import { useScroll } from 'motion/react';

export const StackWheel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const wheelItems = [
    {
      name: 'Retail',
      description: 'Storefront and stockroom inventory with fast order dispatch and live stock counts.',
      tag: '01 / RETAIL STORES',
    },
    {
      name: 'Wholesale',
      description: 'Bulk order processing, catalog pricing, and dependable inventory reservation.',
      tag: '02 / B2B WHOLESALE',
    },
    {
      name: 'Distribution',
      description: 'Multi-stage order routing, fulfillment workflows, and clear activity records.',
      tag: '03 / LOGISTICS',
    },
    {
      name: 'Workshops',
      description: 'Component tracking, parts depletion, and automated low-stock warnings.',
      tag: '04 / REPAIR & ASSEMBLY',
    },
    {
      name: 'Small manufacturing',
      description: 'Raw materials inventory, work-in-progress stock, and finished goods cataloging.',
      tag: '05 / PRODUCTION',
    },
    {
      name: 'Online sellers',
      description: 'Reliable order processing with zero double-selling across all product lines.',
      tag: '06 / COMMERCE',
    },
  ];

  // Scroll progress through the wheel section drives active item
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  useEffect(() => {
    return scrollYProgress.on('change', (progress) => {
      // Map progress [0.25, 0.75] across the items
      const clamped = Math.min(Math.max((progress - 0.25) / 0.5, 0), 1);
      const nextIndex = Math.min(
        Math.floor(clamped * wheelItems.length),
        wheelItems.length - 1
      );
      if (nextIndex >= 0 && nextIndex < wheelItems.length) {
        setActiveIndex(nextIndex);
      }
    });
  }, [scrollYProgress, wheelItems.length]);

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0) {
        setActiveIndex((prev) => Math.min(prev + 1, wheelItems.length - 1));
      } else {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  return (
    <section
      id="stack"
      data-theme="light"
      ref={containerRef}
      className="relative w-full py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-white text-[#141414] border-t border-neutral-300 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <FadeRise>
          <SectionTag index="S.07" label="TEAMS" theme="light" />
        </FadeRise>

        {/* Large statement with scroll-linked text blackening */}
        <div className="mb-14 sm:mb-20 max-w-4xl">
          <ScrollWordReveal
            text="Built for teams that move stock."
            as="h2"
            className="font-sans font-black text-3xl sm:text-5xl md:text-6xl tracking-[-0.03em] leading-tight"
            theme="light"
          />
          <p className="font-mono text-xs sm:text-sm text-neutral-500 uppercase tracking-widest mt-3">
            CLEAR, RELIABLE WORKSPACES TAILORED FOR GROWING OPERATIONS.
          </p>
        </div>

        {/* Text Wheel Area framed by dotted vertical guides */}
        <div
          onWheel={handleWheel}
          className="relative max-w-4xl mx-auto py-12 sm:py-16 flex flex-col items-center justify-center select-none"
        >
          {/* Left dotted vertical guide */}
          <div className="absolute left-4 sm:left-12 top-0 bottom-0 w-[1px] dotted-guide" />
          {/* Right dotted vertical guide */}
          <div className="absolute right-4 sm:right-12 top-0 bottom-0 w-[1px] dotted-guide" />

          {/* Vertical text wheel items */}
          <div className="space-y-4 sm:space-y-6 text-center w-full px-8 sm:px-20">
            {wheelItems.map((item, idx) => {
              const distance = Math.abs(idx - activeIndex);
              const isActive = distance === 0;
              const isAdjacent = distance === 1;
              const isFar = distance >= 2;

              let scaleClass = 'scale-100 text-3xl sm:text-5xl lg:text-6xl font-black text-[#141414]';
              if (isAdjacent) {
                scaleClass = 'scale-90 text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-400 hover:text-neutral-700';
              } else if (isFar) {
                scaleClass = 'scale-75 text-lg sm:text-xl lg:text-2xl font-semibold text-neutral-300 hover:text-neutral-500';
              }

              return (
                <div
                  key={item.name}
                  onClick={() => setActiveIndex(idx)}
                  className="cursor-pointer transition-all duration-300 flex flex-col items-center"
                >
                  <span
                    className={`font-sans tracking-tight transition-all duration-300 ${scaleClass}`}
                  >
                    {item.name}
                  </span>

                  {isActive && (
                    <div className="max-w-md mx-auto mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <span className="font-mono text-[10px] text-[#FFB020] uppercase font-bold tracking-widest block mb-1">
                        {item.tag}
                      </span>
                      <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hint */}
          <div className="mt-12 font-mono text-[10px] text-neutral-400 uppercase tracking-widest text-center">
            SCROLL OR CLICK TO ROTATE TEAMS [0{activeIndex + 1}/06]
          </div>
        </div>
      </div>
    </section>
  );
};

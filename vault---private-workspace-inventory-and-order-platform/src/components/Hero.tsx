import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Layers, LayoutList } from 'lucide-react';
import { HeroCanvas } from './HeroCanvas';
import { FadeRise } from './MotionWrappers';

interface HeroProps {
  onOpenMenu: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const [workspaceCount, setWorkspaceCount] = useState(1);

  // Animated counter for workspace scale
  useEffect(() => {
    let start = 1;
    const target = 1840;
    const duration = 2200;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (target - start) * ease);
      setWorkspaceCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(step);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      data-theme="dark"
      className="relative w-full min-h-screen bg-[#141414] text-white flex flex-col justify-between p-4 sm:p-8 lg:p-12 pt-28 sm:pt-32 overflow-hidden select-none"
    >
      {/* Node-network canvas */}
      <HeroCanvas />

      {/* Mid-right: Mono caption with counting number */}
      <div className="relative z-10 self-end my-auto py-8 text-right max-w-sm">
        <FadeRise delay={0.2}>
          <div className="inline-block p-4 sm:p-5 rounded-xl bg-neutral-950/80 border border-neutral-800 backdrop-blur-sm text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FFB020] animate-pulse" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-neutral-400">
                ACTIVE WORKSPACES
              </span>
            </div>
            <div className="font-mono text-xs sm:text-sm font-semibold tracking-wide text-neutral-200">
              <span className="text-[#FFB020] font-bold">
                {workspaceCount.toLocaleString()}
              </span>{' '}
              COMPANIES ONLINE
            </div>
            <p className="font-mono text-[10px] text-neutral-400 mt-2 leading-relaxed">
              Every company in its own private workspace. Stock, orders and team access completely separated.
            </p>
          </div>
        </FadeRise>
      </div>

      {/* Bottom Area: Headline bottom-left, Thumbnail cards bottom-right */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-2">
        {/* Headline bottom-left in large white grotesque */}
        <div className="lg:col-span-8">
          <FadeRise>
            <div className="font-mono text-xs text-[#FFB020] tracking-widest uppercase mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFB020]" />
              PRIVATE WORKSPACE INVENTORY &amp; ORDERS
            </div>
            <h1 className="font-sans font-black text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] tracking-[-0.035em] leading-[0.95] text-white">
              Inventory and orders, isolated by design.
            </h1>
          </FadeRise>
        </div>

        {/* Bottom-right: two small dark thumbnail cards with mono labels and arrow chips */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
          {/* Card 1: CAPABILITIES */}
          <button
            onClick={() => scrollTo('capabilities')}
            className="group w-full p-3.5 sm:p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-[#FFB020]/50 hover:bg-neutral-900 transition-all text-left flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:text-[#FFB020]">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-wider font-semibold text-neutral-200 group-hover:text-white block">
                  CAPABILITIES
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  Stock, orders &amp; access
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded bg-neutral-800 text-white group-hover:bg-[#FFB020] group-hover:text-[#141414] flex items-center justify-center transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 2: HOW IT WORKS */}
          <button
            onClick={() => scrollTo('how-it-works')}
            className="group w-full p-3.5 sm:p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-[#FFB020]/50 hover:bg-neutral-900 transition-all text-left flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:text-[#FFB020]">
                <LayoutList className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-wider font-semibold text-neutral-200 group-hover:text-white block">
                  HOW IT WORKS
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  Three simple steps
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded bg-neutral-800 text-white group-hover:bg-[#FFB020] group-hover:text-[#141414] flex items-center justify-center transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

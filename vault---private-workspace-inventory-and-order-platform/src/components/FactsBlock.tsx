import React from 'react';
import { Shield, Users, ShoppingBag, BarChart3, Layers, AlertCircle } from 'lucide-react';
import { DashboardMockup } from './UiScreenshots';
import { SectionTag } from './SectionTag';
import { FadeRise, StaggerCard, ParallaxImage, CountUpNumber } from './MotionWrappers';
import { ScrollWordReveal } from './ScrollWordReveal';

export const FactsBlock: React.FC = () => {
  const facts = [
    {
      icon: Shield,
      value: 1,
      isNumber: true,
      label: 'WORKSPACE PER COMPANY',
      sub: 'Dedicated private environment',
    },
    {
      icon: Users,
      value: 2,
      isNumber: true,
      label: 'ACCESS ROLES',
      sub: 'Admin control and staff workflows',
    },
    {
      icon: ShoppingBag,
      value: 4,
      isNumber: true,
      label: 'ORDER STAGES',
      sub: 'Draft, confirmed, fulfilled, cancelled',
    },
    {
      icon: BarChart3,
      value: 3,
      isNumber: true,
      label: 'BUILT-IN REPORTS',
      sub: 'Sales, order volume and stock value',
    },
    {
      icon: Layers,
      value: 5,
      isNumber: true,
      label: 'CORE MODULES',
      sub: 'Products, orders, team, reports, history',
    },
    {
      icon: AlertCircle,
      value: 'LIVE',
      isNumber: false,
      label: 'LOW-STOCK ALERTS',
      sub: 'Instant alerts before stock runs out',
    },
  ];

  return (
    <section
      id="facts"
      data-theme="light"
      className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-12 bg-[#ECEFEC] text-[#141414]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section tag with fade-rise */}
        <FadeRise>
          <SectionTag index="S.01" label="SPECIFICATION" theme="light" />
        </FadeRise>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch mt-4">
          {/* Left: tall dark UI screenshot placeholder (dashboard) with parallax & clip reveal */}
          <div className="lg:col-span-6 flex">
            <ParallaxImage className="w-full h-full">
              <DashboardMockup className="h-full min-h-[460px]" />
            </ParallaxImage>
          </div>

          {/* Right: 2x3 grid separated by hairlines */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="grid grid-cols-2 border border-neutral-300 bg-white/70 rounded-xl overflow-hidden divide-x divide-y divide-neutral-300">
              {facts.map((fact, index) => {
                const Icon = fact.icon;
                return (
                  <StaggerCard
                    key={index}
                    index={index}
                    className="p-5 sm:p-7 flex flex-col justify-between hover:bg-white transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-4 h-4 text-neutral-600 stroke-[1.75]" />
                      <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
                        0{index + 1}
                      </span>
                    </div>

                    <div>
                      <div className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#141414] leading-none">
                        <CountUpNumber value={fact.value} />
                      </div>
                      <div className="font-mono text-[11px] font-semibold tracking-wider text-neutral-800 uppercase mt-3">
                        {fact.label}
                      </div>
                      <div className="font-mono text-[10px] text-neutral-500 mt-1">
                        {fact.sub}
                      </div>
                    </div>
                  </StaggerCard>
                );
              })}
            </div>

            {/* Below, one supporting paragraph with scroll-linked text blackening */}
            <div className="mt-8 pt-6 border-t border-neutral-300">
              <ScrollWordReveal
                text="VAULT gives every company its own private space to manage products, stock and orders."
                className="font-sans text-xl sm:text-2xl font-medium text-neutral-900 leading-snug tracking-tight"
                theme="light"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

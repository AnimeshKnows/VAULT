import React, { useState } from 'react';
import { SectionTag } from './SectionTag';
import { VaultPillButton } from './VaultPillButton';
import { UserPlus, Hash, ShieldCheck, History, Sliders, BarChart3 } from 'lucide-react';
import { FadeRise, StaggerCard } from './MotionWrappers';
import { ScrollWordReveal } from './ScrollWordReveal';

export const PrinciplesSection: React.FC<{ onGetStarted?: () => void }> = ({ onGetStarted }) => {
  const [activeRuleIndex, setActiveRuleIndex] = useState(0);

  const promises = [
    {
      num: '01',
      title: 'Promise 01',
      quote: 'Your stock is always accurate.',
      detail: 'Inventory is checked on creation and reserved when confirmed, preventing overselling.',
    },
    {
      num: '02',
      title: 'Promise 02',
      quote: 'Your data is always private.',
      detail: 'Every business operates in its own private workspace with complete data separation.',
    },
    {
      num: '03',
      title: 'Promise 03',
      quote: 'Your team only sees what it needs.',
      detail: 'Admins maintain full control while Staff focus on order fulfillment and stock updates.',
    },
    {
      num: '04',
      title: 'Promise 04',
      quote: 'Your orders move in clear steps.',
      detail: 'Orders progress through draft, confirmed and fulfilled with complete activity records.',
    },
  ];

  const currentPromise = promises[activeRuleIndex];

  const principlesCards = [
    {
      icon: UserPlus,
      title: 'Self-service signup',
      description: 'Sign up in seconds to create your company workspace and start managing stock immediately.',
    },
    {
      icon: Hash,
      title: 'Unique SKUs',
      description: 'Maintain your own internal catalog numbers and product codes without restrictions.',
    },
    {
      icon: ShieldCheck,
      title: 'Role-based access',
      description: 'Separate Admin controls from Staff workflows so every team member has the right tools.',
    },
    {
      icon: History,
      title: 'Stock history',
      description: 'View recorded adjustments, additions and order decrements across your entire catalog.',
    },
    {
      icon: Sliders,
      title: 'Workspace settings',
      description: 'Customize alerts, categories, team member permissions and company preferences.',
    },
    {
      icon: BarChart3,
      title: 'Reports',
      description: 'Track overall stock valuation, sales numbers and order volume at a glance.',
    },
  ];

  return (
    <section
      id="principles"
      data-theme="light"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-[#ECEFEC] text-[#141414]"
    >
      <div className="max-w-7xl mx-auto">
        <FadeRise>
          <SectionTag index="S.06" label="PRINCIPLES" theme="light" />
        </FadeRise>

        {/* Top Header: Mono eyebrow + Toggle pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div className="font-mono text-xs text-neutral-600 uppercase tracking-widest font-semibold">
            BUILT ON FOUR RULES
          </div>

          {/* 01 / 02 / 03 / 04 toggle pill */}
          <div className="inline-flex items-center p-1 rounded-full bg-white border border-neutral-300 shadow-sm self-start sm:self-auto">
            {promises.map((p, idx) => (
              <button
                key={p.num}
                onClick={() => setActiveRuleIndex(idx)}
                className={`px-3 sm:px-4 py-1 rounded-full font-mono text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeRuleIndex === idx
                    ? 'bg-[#141414] text-white'
                    : 'text-neutral-600 hover:text-[#141414]'
                }`}
                aria-label={`Show ${p.title}`}
              >
                {p.num}
              </button>
            ))}
          </div>
        </div>

        {/* Large statement reveals word by word with scroll-linked text blackening */}
        <div className="min-h-[140px] sm:min-h-[160px] flex flex-col justify-center mb-16 sm:mb-20">
          <blockquote className="font-sans font-black text-3xl sm:text-5xl md:text-6xl lg:text-[62px] tracking-[-0.03em] leading-[1.05]">
            &ldquo;
            <ScrollWordReveal
              key={activeRuleIndex}
              text={currentPromise.quote}
              className="inline"
              theme="light"
              as="span"
            />
            &rdquo;
          </blockquote>
          <FadeRise delay={0.2} key={`sub-${activeRuleIndex}`}>
            <p className="font-mono text-xs sm:text-sm text-neutral-600 mt-4 max-w-3xl">
              {currentPromise.detail}
            </p>
          </FadeRise>
        </div>

        {/* 3-column grid of light cards with line icons, no empty slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {principlesCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <StaggerCard key={idx} index={idx}>
                <div className="h-full p-6 sm:p-7 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 mb-5">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <h3 className="font-sans font-bold text-lg sm:text-xl text-[#141414] tracking-tight leading-snug">
                      {card.title}
                    </h3>
                  </div>
                  <p className="font-sans text-xs sm:text-[13px] text-neutral-600 mt-3 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </StaggerCard>
            );
          })}
        </div>

        {/* Bottom CTA Pill: GET STARTED */}
        <FadeRise delay={0.2} className="mt-12 sm:mt-16 flex justify-end">
          <VaultPillButton
            label="GET STARTED"
            variant="dark"
            onClick={() => {
              if (onGetStarted) {
                onGetStarted();
              } else {
                const el = document.getElementById('signup');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </FadeRise>
      </div>
    </section>
  );
};

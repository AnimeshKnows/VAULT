import React, { useState } from 'react';
import { SectionTag } from './SectionTag';
import { VaultPillButton } from './VaultPillButton';
import { WorkspacePrivacyMockup } from './UiScreenshots';
import { ShieldCheck, X, CheckCircle } from 'lucide-react';
import { FadeRise } from './MotionWrappers';
import { ScrollWordReveal } from './ScrollWordReveal';

export const SecuritySection: React.FC = () => {
  const [readMoreOpen, setReadMoreOpen] = useState(false);

  return (
    <section
      id="security"
      data-theme="light"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-white text-[#141414] border-t border-b border-neutral-300"
    >
      <div className="max-w-7xl mx-auto">
        <FadeRise>
          <SectionTag index="S.04" label="SECURITY" theme="light" />
        </FadeRise>

        {/* Large black headline on white with scroll-linked text blackening */}
        <div className="mb-14 sm:mb-18 max-w-4xl">
          <ScrollWordReveal
            text="Your data stays yours."
            as="h2"
            className="font-sans font-black text-4xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-[-0.035em] leading-[1.02]"
            theme="light"
          />
        </div>

        {/* Below: dark screenshot placeholder on the left, short paragraph on the right + READ MORE pill */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left: dark screenshot placeholder */}
          <div className="lg:col-span-7">
            <WorkspacePrivacyMockup />
          </div>

          {/* Right: short paragraph and READ MORE pill */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFB020]" />
                PRIVATE WORKSPACE GUARANTEE
              </div>

              <ScrollWordReveal
                text="Every company works in a private workspace. Nobody else can see your products, orders or team."
                className="font-sans text-xl sm:text-2xl font-medium text-neutral-900 leading-snug tracking-tight"
                theme="light"
              />

              <p className="font-sans text-sm text-neutral-600 leading-relaxed">
                Your workspace is strictly partitioned. Only people you invite can log in and view your inventory, catalog details and sales figures.
              </p>
            </div>

            <div className="pt-2">
              <VaultPillButton
                label="READ MORE"
                variant="dark"
                onClick={() => setReadMoreOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Deep-dive panel for "READ MORE" with non-technical, benefit copy */}
      {readMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 text-white space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#FFB020] uppercase tracking-widest">
                  PRIVACY OVERVIEW
                </span>
                <h3 className="font-sans font-bold text-2xl tracking-tight mt-0.5">
                  How We Protect Your Workspace
                </h3>
              </div>
              <button
                onClick={() => setReadMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 font-sans text-sm text-neutral-300 leading-relaxed">
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="font-mono text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Total Separation
                </div>
                <p className="text-xs text-neutral-400">
                  Every company operates in its own private workspace. Your items, prices, orders and customer records are never shared with or visible to any other business.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="font-mono text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Team Role Control
                </div>
                <p className="text-xs text-neutral-400">
                  You decide who has access. Admins manage workspace settings and user invitations, while staff have focused access to daily inventory and order fulfillment.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setReadMoreOpen(false)}
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

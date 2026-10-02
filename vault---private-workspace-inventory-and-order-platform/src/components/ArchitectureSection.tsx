import React, { useState, useEffect, useRef } from 'react';
import { SectionTag } from './SectionTag';
import { VaultPillButton } from './VaultPillButton';
import { FadeRise, StaggerCard } from './MotionWrappers';
import { useScroll, useTransform, motion } from 'motion/react';

interface HowItWorksSectionProps {
  onGetStarted?: () => void;
}

export const ArchitectureSection: React.FC<HowItWorksSectionProps> = ({ onGetStarted }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrambleText, setScrambleText] = useState('SIGN UP. ADD PRODUCTS. TAKE ORDERS.');
  const [scrambled, setScrambled] = useState(false);

  // Scroll tracking for letter-by-letter reveal of "minutes."
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.85', 'center 0.5'],
  });

  // Target word: "minutes."
  const targetWord = 'minutes.';
  const charProgress = useTransform(scrollYProgress, [0.2, 0.9], [0, targetWord.length]);
  const [resolvedChars, setResolvedChars] = useState(0);

  useEffect(() => {
    return charProgress.on('change', (v) => {
      setResolvedChars(Math.floor(v));
    });
  }, [charProgress]);

  // Scramble animation for "SIGN UP. ADD PRODUCTS. TAKE ORDERS."
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !scrambled) {
          setScrambled(true);
          startScramble();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, [scrambled]);

  const startScramble = () => {
    const targetText = 'SIGN UP. ADD PRODUCTS. TAKE ORDERS.';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.';
    let iteration = 0;
    const interval = setInterval(() => {
      setScrambleText((_) =>
        targetText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return targetText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= targetText.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 30);
  };

  const steps = [
    {
      step: '01',
      title: '1 Create your workspace',
      description: 'Sign up in seconds to get a private workspace for your business. Invite your team and assign Admin or Staff roles.',
      diagram: (
        <svg className="w-full h-12 stroke-neutral-500 fill-none" viewBox="0 0 200 48">
          <circle cx="30" cy="24" r="10" stroke="#FFB020" strokeWidth="2" />
          <path d="M40 24h50" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x="90" y="12" width="75" height="24" rx="4" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="127" y="27" fill="#FFF" fontSize="8" fontFamily="monospace" textAnchor="middle">
            WORKSPACE
          </text>
        </svg>
      ),
    },
    {
      step: '02',
      title: '2 Add your products',
      description: 'Enter your SKUs, categories, prices and starting stock counts. Set low-stock thresholds for instant alerts.',
      diagram: (
        <svg className="w-full h-12 stroke-neutral-500 fill-none" viewBox="0 0 200 48">
          <rect x="25" y="10" width="40" height="28" rx="3" stroke="#6B7280" strokeWidth="1.5" />
          <path d="M65 24h45" strokeWidth="1.5" />
          <polygon points="110,14 130,24 110,34" stroke="#FFB020" strokeWidth="1.5" />
          <path d="M130 24h30" strokeWidth="1.5" />
          <circle cx="165" cy="24" r="6" stroke="#10B981" strokeWidth="2" />
        </svg>
      ),
    },
    {
      step: '03',
      title: '3 Start taking orders',
      description: 'Draft orders, allocate stock, and confirm when ready to ship. Stock updates in real time with a clear activity log.',
      diagram: (
        <svg className="w-full h-12 stroke-neutral-500 fill-none" viewBox="0 0 200 48">
          <circle cx="35" cy="24" r="12" stroke="#38BDF8" strokeWidth="1.5" />
          <text x="35" y="27" fill="#38BDF8" fontSize="8" fontFamily="monospace" textAnchor="middle">
            ORDER
          </text>
          <path d="M47 24h50" strokeWidth="1.5" />
          <rect x="97" y="14" width="70" height="20" rx="3" stroke="#10B981" strokeWidth="1.5" />
          <text x="132" y="27" fill="#10B981" fontSize="8" fontFamily="monospace" textAnchor="middle">
            CONFIRMED
          </text>
        </svg>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      data-theme="dark"
      ref={sectionRef}
      className="relative w-full py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-[#141414] text-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <FadeRise>
          <SectionTag index="S.05" label="HOW IT WORKS" theme="dark" />
        </FadeRise>

        {/* Big animated headline: "Set up in minutes." */}
        <div className="mb-6 max-w-5xl">
          <h2 className="font-sans font-black text-4xl sm:text-6xl md:text-7xl lg:text-[80px] tracking-[-0.035em] leading-[0.98]">
            <span>Set up in </span>
            <span className="inline-block">
              {targetWord.split('').map((char, idx) => {
                const isResolved = idx < resolvedChars;
                return (
                  <span
                    key={idx}
                    className={`transition-colors duration-200 ${
                      isResolved
                        ? 'text-[#FFB020]'
                        : 'text-neutral-500'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          </h2>

          {/* Scrambling subline: "SIGN UP. ADD PRODUCTS. TAKE ORDERS." */}
          <div className="mt-4 font-mono text-xs sm:text-sm tracking-widest text-[#FFB020] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFB020]" />
            <span>{scrambleText}</span>
          </div>
        </div>

        {/* Three dark cards (3 columns, near-black background) with line diagram and title below */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-14 sm:mt-18">
          {steps.map((item, idx) => (
            <StaggerCard key={idx} index={idx}>
              <div className="h-full p-6 sm:p-7 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                      STEP {item.step}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-[#FFB020] transition-colors" />
                  </div>

                  {/* Line diagram on each */}
                  <div className="my-3 py-3 bg-neutral-900/50 rounded-lg border border-neutral-900 flex items-center justify-center">
                    {item.diagram}
                  </div>

                  {/* Title below */}
                  <h3 className="font-sans font-bold text-xl text-white tracking-tight mt-4">
                    {item.title}
                  </h3>
                </div>

                {/* Description in light grey with AA contrast (> 4.5:1) */}
                <p className="font-sans text-sm text-[#A3A3A3] mt-3 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </StaggerCard>
          ))}
        </div>

        {/* Closing pill: GET STARTED */}
        <FadeRise delay={0.2} className="mt-12 sm:mt-16 flex justify-end">
          <VaultPillButton
            label="GET STARTED"
            variant="light"
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

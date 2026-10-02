import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface HeaderNavProps {
  onToggleMenu: () => void;
  isMenuOpen: boolean;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onToggleMenu,
  isMenuOpen,
  menuButtonRef,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDarkSection, setIsDarkSection] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // While menu is open, header must be locked visible
      if (isMenuOpen) {
        setIsVisible(true);
        setIsDarkSection(true);
        return;
      }

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      // 1. Hide-on-scroll logic
      if (currentScrollY <= 80) {
        setIsVisible(true);
      } else if (delta > 6) {
        setIsVisible(false);
      } else if (delta < -6) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;

      // 2. Dark vs light section detection
      const sampleY = 50;
      const sampleX = window.innerWidth / 2;
      const element = document.elementFromPoint(sampleX, sampleY);
      const darkSection = element?.closest('[data-theme="dark"]');
      setIsDarkSection(!!darkSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  const isReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // When menu is open, header is locked visible
  const effectiveVisible = isMenuOpen || isVisible;
  const effectiveDark = isMenuOpen || isDarkSection;

  const leftTransform = isReduced
    ? 'none'
    : effectiveVisible
    ? 'translateX(0)'
    : 'translateX(-140%)';

  const rightTransform = isReduced
    ? 'none'
    : effectiveVisible
    ? 'translateX(0)'
    : 'translateX(140%)';

  const opacity = isReduced ? 1 : effectiveVisible ? 1 : 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 pointer-events-none select-none">
      <div className="w-full flex items-center justify-between">
        {/* Left: Logo and wordmark */}
        <div
          style={{
            transform: leftTransform,
            opacity: opacity,
            transition:
              'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="pointer-events-auto flex items-center gap-3 transition-colors duration-250"
        >
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB020] rounded-lg p-1"
            aria-label="VAULT Home"
          >
            <div
              className={`w-9 h-9 rounded flex items-center justify-center shadow-md transition-colors duration-250 ${
                effectiveDark
                  ? 'bg-neutral-900 border border-neutral-700/80 text-white'
                  : 'bg-white border border-neutral-300 text-[#141414]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#FFB020]" />
            </div>
            <div>
              <span
                className={`font-mono text-base sm:text-lg font-bold tracking-widest uppercase block leading-none transition-colors duration-250 ${
                  effectiveDark ? 'text-white' : 'text-[#141414]'
                }`}
              >
                VAULT
              </span>
              <span
                className={`font-mono text-[9px] sm:text-[10px] tracking-wider hidden sm:block mt-1 transition-colors duration-250 ${
                  effectiveDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                PRIVATE WORKSPACE INVENTORY &amp; ORDERS
              </span>
            </div>
          </a>
        </div>

        {/* Right: Menu button (circular button ~44px + plain "Menu" grotesque label) */}
        <div
          style={{
            transform: rightTransform,
            opacity: opacity,
            transition:
              'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="pointer-events-auto flex items-center gap-3"
        >
          {/* Plain "Menu" mono-free grotesque label */}
          <span
            className={`font-sans font-medium text-sm sm:text-base tracking-tight transition-colors duration-250 ${
              effectiveDark ? 'text-white' : 'text-[#141414]'
            }`}
          >
            Menu
          </span>

          {/* 44px circular button */}
          <button
            ref={menuButtonRef as any}
            onClick={onToggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="vault-fullscreen-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className={`group relative w-11 h-11 rounded-full flex flex-col items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB020] cursor-pointer ${
              isMenuOpen
                ? 'border border-white/70 bg-transparent'
                : effectiveDark
                ? 'border border-white/70 bg-transparent hover:bg-[#FFB020] hover:border-[#FFB020] hover:scale-[1.06]'
                : 'border border-neutral-900/70 bg-transparent hover:bg-[#FFB020] hover:border-[#FFB020] hover:scale-[1.06]'
            }`}
            style={{ transitionDuration: '200ms' }}
          >
            {/* Hamburger 3 lines morphing into X */}
            <div className="relative w-4 h-3.5 flex flex-col justify-between items-center pointer-events-none">
              {/* Top line */}
              <span
                className={`block w-4 h-[1.5px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  isMenuOpen
                    ? 'bg-white translate-y-[5.5px] rotate-45'
                    : effectiveDark
                    ? 'bg-white group-hover:bg-[#141414]'
                    : 'bg-[#141414] group-hover:bg-[#141414]'
                }`}
              />

              {/* Middle line */}
              <span
                className={`block w-4 h-[1.5px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  isMenuOpen
                    ? 'opacity-0 scale-x-0'
                    : effectiveDark
                    ? 'bg-white group-hover:bg-[#141414]'
                    : 'bg-[#141414] group-hover:bg-[#141414]'
                }`}
              />

              {/* Bottom line */}
              <span
                className={`block w-4 h-[1.5px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  isMenuOpen
                    ? 'bg-white -translate-y-[5.5px] -rotate-45'
                    : effectiveDark
                    ? 'bg-white group-hover:bg-[#141414]'
                    : 'bg-[#141414] group-hover:bg-[#141414]'
                }`}
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Linkedin } from 'lucide-react';

interface PushDownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigateRoute: (route: string) => void;
  firstLinkRef: React.RefObject<HTMLAnchorElement | HTMLButtonElement | null>;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const PushDownMenu: React.FC<PushDownMenuProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
  onNavigateRoute,
  firstLinkRef,
  menuButtonRef,
}) => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'En' | 'Es'>('En');
  const [isMobile, setIsMobile] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation & Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    // Focus the first link on open
    const focusTimer = setTimeout(() => {
      if (firstLinkRef.current) {
        firstLinkRef.current.focus();
      }
    }, 180);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        menuButtonRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        // Collect all focusable elements inside header button and menu
        const menuEl = menuContainerRef.current;
        const buttonEl = menuButtonRef.current;
        if (!menuEl) return;

        const focusableInMenu = Array.from(
          menuEl.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        const focusableList: HTMLElement[] = [];
        if (buttonEl) focusableList.push(buttonEl);
        focusableList.push(...focusableInMenu);

        if (focusableList.length === 0) return;

        const firstEl = focusableList[0];
        const lastEl = focusableList[focusableList.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, firstLinkRef, menuButtonRef]);

  // Links data configuration
  // Column 1: Capabilities, Modules, Security
  // Column 2: How it works, Principles, Contact
  // Column 3: Log in, Get started
  const col1 = [
    { id: 'capabilities', label: 'Capabilities', type: 'section', target: 'capabilities' },
    { id: 'modules', label: 'Modules', type: 'section', target: 'modules' },
    { id: 'security', label: 'Security', type: 'section', target: 'security' },
  ];

  const col2 = [
    { id: 'how-it-works', label: 'How it works', type: 'section', target: 'how-it-works' },
    { id: 'principles', label: 'Principles', type: 'section', target: 'principles' },
    { id: 'contact', label: 'Contact', type: 'section', target: 'footer' },
  ];

  const col3 = [
    { id: 'login', label: 'Log in', type: 'route', target: '/login' },
    { id: 'get-started', label: 'Get started', type: 'route', target: '/signup' },
  ];

  const renderLinkItem = (
    item: { id: string; label: string; type: string; target: string },
    colIdx: number,
    itemIdx: number,
    isFirst: boolean = false
  ) => {
    const isHovered = hoveredLink === item.id;
    const isOtherHovered = hoveredLink !== null && !isHovered;

    // Open delay math: after 150ms start, 60ms between links, 80ms between columns
    const openDelay = isReducedMotion
      ? 0.05
      : 0.15 + colIdx * 0.08 + itemIdx * 0.06;
    // Close delay math: reversed order with 30ms steps
    const closeDelay = isReducedMotion
      ? 0
      : (2 - colIdx) * 0.04 + (2 - itemIdx) * 0.03;

    return (
      <div key={item.id} className="overflow-hidden py-1">
        <motion.div
          initial={{ y: '110%' }}
          animate={
            isOpen
              ? { y: 0, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: openDelay } }
              : { y: '110%', transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1], delay: closeDelay } }
          }
        >
          <button
            ref={isFirst ? (firstLinkRef as any) : undefined}
            onClick={() => {
              if (item.type === 'section') {
                onNavigateSection(item.target);
              } else {
                onNavigateRoute(item.target);
              }
            }}
            onMouseEnter={() => setHoveredLink(item.id)}
            onMouseLeave={() => setHoveredLink(null)}
            onFocus={() => setHoveredLink(item.id)}
            onBlur={() => setHoveredLink(null)}
            className={`group block text-left font-sans text-3xl sm:text-[40px] font-semibold text-white tracking-tight leading-[1.05] transition-opacity duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFB020] rounded ${
              isOtherHovered ? 'opacity-40' : 'opacity-100'
            }`}
          >
            {item.id === 'get-started' ? (
              <span className="relative flex items-center">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full bg-[#FFB020] transition-all duration-200 ${
                    isHovered
                      ? 'opacity-100 translate-x-0 mr-2.5 w-2.5'
                      : 'opacity-0 -translate-x-3 w-0 mr-0'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </span>
            ) : (
              item.label
            )}
          </button>
        </motion.div>
      </div>
    );
  };

  return (
    <div
      id="vault-fullscreen-menu"
      ref={menuContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Full-screen site menu"
      className={`fixed inset-0 z-10 bg-[#141414] text-white overflow-hidden select-none transition-[visibility] duration-700 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
    >
      {/* Background layer container with subtle parallax */}
      <motion.div
        initial={{ opacity: 0, y: '-4vh' }}
        animate={
          isOpen
            ? {
                opacity: 1,
                y: 0,
                transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
              }
            : {
                opacity: 0,
                y: '-4vh',
                transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
              }
        }
        className="relative w-full h-full flex flex-col justify-between"
      >
        {/* Main Content Block starting at ~28vh on desktop, ~24vh on mobile */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-[24vh] md:pt-[28vh]">
          {isMobile ? (
            /* MOBILE LAYOUT: Single column */
            <div className="flex flex-col space-y-4 max-w-sm">
              <div className="space-y-2.5">
                {[...col1, ...col2, ...col3].map((item, idx) =>
                  renderLinkItem(item, 0, idx, idx === 0)
                )}
              </div>

              {/* Small items at the bottom of the column */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={
                  isOpen
                    ? {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.42 },
                      }
                    : { opacity: 0, y: 12, transition: { duration: 0.25 } }
                }
                className="pt-6 border-t border-neutral-800 flex items-center justify-between"
              >
                {/* Language Toggle En / Es */}
                <div className="flex items-center gap-3 font-mono text-sm font-semibold">
                  <button
                    onClick={() => setActiveLang('En')}
                    className={`transition-colors cursor-pointer ${
                      activeLang === 'En' ? 'text-[#FFB020]' : 'text-white'
                    }`}
                  >
                    En
                  </button>
                  <span className="text-neutral-600">/</span>
                  <button
                    onClick={() => setActiveLang('Es')}
                    className={`transition-colors cursor-pointer ${
                      activeLang === 'Es' ? 'text-[#FFB020]' : 'text-white'
                    }`}
                  >
                    Es
                  </button>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-md bg-white text-[#141414] hover:bg-[#FFB020] flex items-center justify-center transition-colors"
                    aria-label="VAULT on GitHub"
                  >
                    <Github className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-md bg-white text-[#141414] hover:bg-[#FFB020] flex items-center justify-center transition-colors"
                    aria-label="VAULT on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 fill-current" />
                  </a>
                </div>
              </motion.div>
            </div>
          ) : (
            /* DESKTOP LAYOUT: 3 Equal Columns */
            <div className="grid grid-cols-3 gap-8 lg:gap-12 items-start">
              {/* Column 1: Capabilities, Modules, Security */}
              <div className="space-y-4">
                <div className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest mb-3">
                  01 / PLATFORM
                </div>
                <div className="space-y-2">
                  {col1.map((item, idx) =>
                    renderLinkItem(item, 0, idx, idx === 0)
                  )}
                </div>
              </div>

              {/* Column 2: How it works, Principles, Contact */}
              <div className="space-y-4">
                <div className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest mb-3">
                  02 / SYSTEM
                </div>
                <div className="space-y-2">
                  {col2.map((item, idx) =>
                    renderLinkItem(item, 1, idx, false)
                  )}
                </div>
              </div>

              {/* Column 3: Log in, Get started, Language Toggle & Socials */}
              <div className="space-y-4">
                <div className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest mb-3">
                  03 / ACCESS
                </div>
                <div className="space-y-2">
                  {col3.map((item, idx) =>
                    renderLinkItem(item, 2, idx, false)
                  )}
                </div>

                {/* Small items: language toggle & socials */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={
                    isOpen
                      ? {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.44 },
                        }
                      : { opacity: 0, y: 12, transition: { duration: 0.25 } }
                  }
                  className="pt-6 mt-4 border-t border-neutral-800/80 flex items-center justify-between max-w-[280px]"
                >
                  {/* Language Toggle En / Es */}
                  <div className="flex items-center gap-3 font-mono text-sm font-semibold">
                    <button
                      onClick={() => setActiveLang('En')}
                      className={`transition-colors cursor-pointer ${
                        activeLang === 'En' ? 'text-[#FFB020]' : 'text-white'
                      }`}
                      aria-label="Select English language"
                    >
                      En
                    </button>
                    <span className="text-neutral-600">/</span>
                    <button
                      onClick={() => setActiveLang('Es')}
                      className={`transition-colors cursor-pointer ${
                        activeLang === 'Es' ? 'text-[#FFB020]' : 'text-white'
                      }`}
                      aria-label="Select Spanish language"
                    >
                      Es
                    </button>
                  </div>

                  {/* Social Icons */}
                  <div className="flex items-center gap-2.5">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-md bg-white text-[#141414] hover:bg-[#FFB020] flex items-center justify-center transition-colors"
                      aria-label="VAULT on GitHub"
                    >
                      <Github className="w-4 h-4 fill-current" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-md bg-white text-[#141414] hover:bg-[#FFB020] flex items-center justify-center transition-colors"
                      aria-label="VAULT on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4 fill-current" />
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Ambient bottom footer watermark */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-6 flex items-center justify-between font-mono text-[10px] text-neutral-600">
          <span>VAULT · PRIVATE WORKSPACE LEDGER</span>
          <span>EST. 2026</span>
        </div>
      </motion.div>
    </div>
  );
};

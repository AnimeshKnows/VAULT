import React, { useState, useEffect, useRef } from 'react';
import { NavigationPage } from '../../types';
import { VAULT_LOGO_URL } from '../../data/mockData';

interface CinematicLandingProps {
  onNavigate: (page: NavigationPage) => void;
  onSceneChange?: (sceneIndex: number) => void;
  isLoggedIn?: boolean;
  userInitials?: string;
}

export const CinematicLanding: React.FC<CinematicLandingProps> = ({
  onNavigate,
  onSceneChange,
  isLoggedIn = false,
  userInitials = 'IN',
}) => {
  const [activeScene, setActiveScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [exitingScene, setExitingScene] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselResumeAt = useRef(0);
  const dragStartX = useRef(0);
  const dragActive = useRef(false);

  // Wheel accumulation for natural, butter-smooth inertial trackpad & mouse scrolling
  const wheelAccumulator = useRef(0);
  const touchStartY = useRef(0);
  const lastTransitionTime = useRef(0);
  const decayRaf = useRef<number | null>(null);

  const totalScenes = 4;

  const featureCards = [
    {
      id: 'products',
      title: 'Manage Products & SKUs',
      desc: 'Variant matrices, multi-warehouse bins, and serial numbers. Automated reorder triggers notify procurement.',
      icon: 'inventory_2',
      accent: '#5356ff',
      statLabel: 'Active Catalog',
      statVal: '14,280 SKUs',
    },
    {
      id: 'orders',
      title: 'Process Orders Seamlessly',
      desc: 'From draft reservation to pick, pack, and automated dispatch. Never double-commit stock during demand surges.',
      icon: 'receipt_long',
      accent: '#82cfff',
      statLabel: 'Order Lifecycle',
      statVal: 'Draft → Shipped',
    },
    {
      id: 'security',
      title: 'Secure & Multi-Tenant',
      desc: 'Complete physical and logical workspace isolation per tenant. Role-based granular permissions at row level.',
      icon: 'hub',
      accent: '#a855f7',
      statLabel: 'Encryption',
      statVal: 'AES-256 GCM',
    },
    {
      id: 'stock',
      title: 'Stock Adjustments',
      desc: 'Cycle counts, damage write-offs, and inbound receipts with full audit history on every mutation.',
      icon: 'tune',
      accent: '#10B981',
      statLabel: 'Audit Trail',
      statVal: 'Immutable Log',
    },
    {
      id: 'reports',
      title: 'Live Reports & Valuation',
      desc: 'Revenue, order volume, and stock valuation aggregates update as your catalog and orders change.',
      icon: 'analytics',
      accent: '#F59E0B',
      statLabel: 'Insight Latency',
      statVal: '< 100ms',
    },
    {
      id: 'team',
      title: 'Team Access Control',
      desc: 'Invite Admin and Staff roles, deactivate access instantly, and keep every action attributable.',
      icon: 'group',
      accent: '#06B6D4',
      statLabel: 'RBAC Roles',
      statVal: 'Admin · Staff',
    },
  ] as const;

  const carouselVisible = 3;
  const carouselLoop = [...featureCards, ...featureCards];

  const goToCarousel = (index: number) => {
    const next = ((index % featureCards.length) + featureCards.length) % featureCards.length;
    setCarouselIndex(next);
    carouselResumeAt.current = Date.now() + 3200;
  };

  const onCarouselPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragActive.current = true;
    dragStartX.current = e.clientX;
    setIsDragging(true);
    setCarouselPaused(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onCarouselPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragActive.current) return;
    setDragOffsetPx(e.clientX - dragStartX.current);
  };

  const onCarouselPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragActive.current) return;
    dragActive.current = false;
    setIsDragging(false);
    setCarouselPaused(false);

    const delta = e.clientX - dragStartX.current;
    setDragOffsetPx(0);

    const threshold = 56;
    if (delta <= -threshold) {
      goToCarousel(carouselIndex + 1);
    } else if (delta >= threshold) {
      goToCarousel(carouselIndex - 1);
    } else {
      carouselResumeAt.current = Date.now() + 1800;
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (activeScene !== 1 || carouselPaused) return;
    const timer = window.setInterval(() => {
      if (Date.now() < carouselResumeAt.current) return;
      setCarouselIndex((prev) => (prev + 1) % featureCards.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [activeScene, carouselPaused, featureCards.length]);

  const goToScene = (index: number) => {
    if (index < 0 || index >= totalScenes || index === activeScene) return;

    const now = Date.now();
    // Smooth transition pacing
    if (now - lastTransitionTime.current < 600) return;

    lastTransitionTime.current = now;
    setIsTransitioning(true);
    setExitingScene(activeScene);
    setActiveScene(index);
    if (onSceneChange) onSceneChange(index);

    window.setTimeout(() => {
      setExitingScene(null);
    }, 320);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 850);
  };

  const sceneRevealClass = (sceneIndex: number) => {
    if (activeScene === sceneIndex) return 'reveal-scene is-active';
    if (exitingScene === sceneIndex) return 'reveal-scene is-exiting';
    return 'reveal-scene';
  };

  // Continuous wheel accumulator decay for smooth trackpad experience
  useEffect(() => {
    const decayLoop = () => {
      if (Math.abs(wheelAccumulator.current) > 0.5) {
        wheelAccumulator.current *= 0.88; // Smooth exponential friction
      } else {
        wheelAccumulator.current = 0;
      }
      decayRaf.current = requestAnimationFrame(decayLoop);
    };

    decayRaf.current = requestAnimationFrame(decayLoop);
    return () => {
      if (decayRaf.current) cancelAnimationFrame(decayRaf.current);
    };
  }, []);

  // Smooth wheel & gesture handling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Accumulate wheel delta
      wheelAccumulator.current += e.deltaY;

      const now = Date.now();
      if (now - lastTransitionTime.current < 600 || isTransitioning) {
        return;
      }

      // Smooth trigger threshold
      const threshold = 48;
      if (wheelAccumulator.current > threshold) {
        wheelAccumulator.current = 0;
        goToScene(activeScene + 1);
      } else if (wheelAccumulator.current < -threshold) {
        wheelAccumulator.current = 0;
        goToScene(activeScene - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToScene(activeScene + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToScene(activeScene - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToScene(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToScene(totalScenes - 1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 35) {
        if (deltaY > 0) goToScene(activeScene + 1);
        else goToScene(activeScene - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeScene, isTransitioning]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-transparent text-[#dfe2ef] font-sans">
      {/* ========================================================================= */}
      {/* 1. PERSISTENT CINEMATIC HUD / TOP BAR                                     */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#080B11]/70 backdrop-blur-2xl z-50 px-6 sm:px-12 flex items-center justify-between border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => goToScene(0)}>
          <img src={VAULT_LOGO_URL} alt="VAULT" className="h-8 w-8 object-contain drop-shadow-[0_0_12px_rgba(83,86,255,0.6)]" />
          <div className="flex flex-col">
            <span className="font-semibold text-lg text-[#F1F5F9] tracking-tight leading-tight">VAULT</span>
            <span className="text-[11px] font-medium tracking-wide text-[#94A3B8] leading-none">InventoryOS</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="btn-hover flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#c0c1ff] hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/15 cursor-pointer backdrop-blur-md shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            title="Log in"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span>Log in</span>
          </button>

          <button
            onClick={() => onNavigate('signup')}
            className="btn-hover flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5356ff] to-[#4142ee] hover:from-[#6467ff] hover:to-[#5152fa] text-white text-sm font-medium shadow-[0_0_20px_rgba(83,86,255,0.45)] hover:shadow-[0_0_32px_rgba(83,86,255,0.7)] cursor-pointer border border-white/15"
            title="Sign up"
          >
            <span className="material-symbols-outlined text-[18px]">apartment</span>
            <span>Sign up</span>
          </button>

          {isLoggedIn && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-hover hidden sm:flex ml-1 w-10 h-10 items-center justify-center rounded-full bg-[#5356ff]/25 text-[#c0c1ff] text-xs font-semibold ring-1 ring-white/15 hover:ring-[#5356ff] cursor-pointer shadow-md hover:shadow-[0_0_20px_rgba(83,86,255,0.45)]"
              title="Open workspace"
            >
              {userInitials}
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. STAGE CONTAINER (Scenes smoothly glide within one continuous universe) */}
      {/* ========================================================================= */}
      <div className="relative w-full h-full flex items-center justify-center pt-16 px-6 sm:px-12 overflow-hidden">
        {/* =========================================================================
            SCENE 0: COMMAND DECK & HERO ENVIRONMENT
           ========================================================================= */}
        <div
          className={`absolute inset-0 pt-16 px-6 sm:px-12 max-w-7xl mx-auto flex items-center transition-opacity duration-500 ease-out will-change-[opacity] ${
            activeScene === 0 || exitingScene === 0
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className={`w-full max-w-3xl flex flex-col items-start ${sceneRevealClass(0)}`}>
              <h1 className="reveal-item reveal-headline text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] mb-5">
                Inventory & Order Management for{' '}
                <span className="bg-gradient-to-r from-[#c0c1ff] via-[#82cfff] to-[#5356ff] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(83,86,255,0.4)]">
                  Modern Businesses
                </span>
              </h1>

              <p className="reveal-item reveal-paragraph text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-6 max-w-2xl">
                VAULT unifies high-frequency SKU logistics, stock adjustments, and multi-channel fulfillment on an immutable ledger.
              </p>

              <div className="reveal-item reveal-cta flex flex-wrap items-center gap-3.5 mb-6">
                <button
                  onClick={() => onNavigate('login')}
                  className="btn-hover px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#5356ff] to-[#4142ee] hover:from-[#6467ff] hover:to-[#5152fa] text-white font-semibold text-sm flex items-center gap-2 shadow-[0_0_24px_rgba(83,86,255,0.5)] hover:shadow-[0_0_40px_rgba(83,86,255,0.8)] cursor-pointer border border-white/15"
                >
                  <span>Get Started</span>
                </button>
              </div>
          </div>
        </div>

        {/* =========================================================================
            SCENE 1: ARCHITECTURAL MODULES (Transformed Environment)
           ========================================================================= */}
        <div
          className={`absolute inset-0 pt-16 px-4 sm:px-8 lg:px-12 max-w-[96rem] mx-auto flex items-center transition-opacity duration-500 ease-out will-change-[opacity] ${
            activeScene === 1 || exitingScene === 1
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className={`w-full ${sceneRevealClass(1)}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 lg:mb-8">
              <div className="max-w-4xl">
                <h2 className="reveal-item reveal-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  High-velocity modular engine for multi-tenant zero-drift fulfillment.
                </h2>
              </div>
              <p className="reveal-item reveal-paragraph text-sm text-[#94A3B8] max-w-sm">
                Each module runs isolated peer-to-peer consensus across warehouse boundaries.
              </p>
            </div>

            {/* Feature cards carousel — auto + cursor swipe */}
            <div className="reveal-item reveal-feature relative">
              {/* Padding keeps hover lift/scale inside the clip box */}
              <div
                className={`overflow-x-hidden overflow-y-visible px-2 sm:px-4 py-10 -my-2 touch-pan-y select-none ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onPointerDown={onCarouselPointerDown}
                onPointerMove={onCarouselPointerMove}
                onPointerUp={onCarouselPointerUp}
                onPointerCancel={onCarouselPointerUp}
              >
                <div
                  className={`flex will-change-transform ${
                    isDragging
                      ? 'transition-none'
                      : 'transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]'
                  }`}
                  style={{
                    width: `${(carouselLoop.length / carouselVisible) * 100}%`,
                    transform: `translateX(calc(-${(carouselIndex * 100) / carouselLoop.length}% + ${dragOffsetPx}px))`,
                  }}
                >
                  {carouselLoop.map((m, idx) => (
                    <div
                      key={`${m.id}-${idx}`}
                      className="shrink-0 px-2 sm:px-3 lg:px-4"
                      style={{ width: `${100 / carouselLoop.length}%` }}
                    >
                      <div
                        onMouseEnter={() => {
                          if (!dragActive.current) setCarouselPaused(true);
                        }}
                        onMouseLeave={() => {
                          if (!dragActive.current) setCarouselPaused(false);
                        }}
                        className={`group relative z-0 flex flex-col h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[340px] p-7 sm:p-8 lg:p-9 rounded-3xl border border-white/10 bg-[#0E1424]/80 backdrop-blur-2xl shadow-xl transition-all duration-500 ease-out ${
                          isDragging
                            ? ''
                            : 'hover:z-10 hover:-translate-y-3 hover:scale-[1.04] hover:border-[#a855f7]/60 hover:shadow-[0_24px_60px_rgba(168,85,247,0.32)] hover:bg-[#0E1424]'
                        }`}
                      >
                        <div className="flex items-center mb-5">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                            style={{ backgroundColor: `${m.accent}25` }}
                          >
                            <span
                              className="material-symbols-outlined text-[28px]"
                              style={{ color: m.accent }}
                            >
                              {m.icon}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 transition-colors duration-300 group-hover:text-[#c0c1ff]">
                          {m.title}
                        </h3>
                        <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                          {m.desc}
                        </p>

                        <div className="mt-auto bg-black/40 p-3.5 sm:p-4 rounded-2xl border border-white/10 flex items-center justify-between text-xs sm:text-sm font-mono transition-colors duration-300 group-hover:border-white/20">
                          <span className="text-[#94A3B8]">{m.statLabel}</span>
                          <span className="text-white font-bold" style={{ color: m.accent }}>
                            {m.statVal}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-center gap-2.5">
                {featureCards.map((card, idx) => (
                  <button
                    key={card.id}
                    type="button"
                    aria-label={`Show ${card.title}`}
                    onClick={() => goToCarousel(idx)}
                    className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                      carouselIndex === idx
                        ? 'w-8 bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.7)]'
                        : 'w-2 bg-white/20 hover:bg-white/45'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SCENE 2: PHYSICAL WAREHOUSE CONSENSUS
           ========================================================================= */}
        <div
          className={`absolute inset-0 pt-16 px-6 sm:px-12 max-w-7xl mx-auto flex items-center transition-opacity duration-500 ease-out will-change-[opacity] ${
            activeScene === 2 || exitingScene === 2
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className={`w-full ${sceneRevealClass(2)}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              <div className="lg:col-span-7">
                <div className="reveal-item reveal-eyebrow text-[11px] font-mono tracking-[0.2em] uppercase text-white/80 mb-4">
                  VAULT <span className="text-[#2DD4BF]">//</span> INVENTORYOS
                </div>
                <h2 className="reveal-item reveal-headline text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 leading-[1.15]">
                  Inventory and orders, under one{' '}
                  <span className="text-[#2DD4BF]">secure workspace.</span>
                </h2>
                <p className="reveal-item reveal-paragraph text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-10 max-w-2xl">
                  Manage products, stock levels, and order workflows from a tenant-isolated system built for day-to-day operations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                  <div className="reveal-item reveal-feature flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#5356ff] text-[22px] mt-0.5">deployed_code</span>
                    <div>
                      <div className="text-[11px] font-semibold tracking-widest text-white uppercase mb-1">Products</div>
                      <div className="text-xs text-[#94A3B8] leading-relaxed">Create, update, search, and manage inventory</div>
                    </div>
                  </div>
                  <div className="reveal-item reveal-feature-2 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#5356ff] text-[22px] mt-0.5">shopping_cart</span>
                    <div>
                      <div className="text-[11px] font-semibold tracking-widest text-white uppercase mb-1">Orders</div>
                      <div className="text-xs text-[#94A3B8] leading-relaxed">Draft, confirm, fulfill, or cancel orders</div>
                    </div>
                  </div>
                  <div className="reveal-item reveal-feature-3 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#5356ff] text-[22px] mt-0.5">group</span>
                    <div>
                      <div className="text-[11px] font-semibold tracking-widest text-white uppercase mb-1">Access</div>
                      <div className="text-xs text-[#94A3B8] leading-relaxed">Admin and Staff permissions by role</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="reveal-item reveal-eyebrow text-[11px] font-semibold tracking-[0.2em] uppercase text-white mb-5">
                  Workspace
                </div>
                <ul className="space-y-3.5 text-sm text-[#CBD5E1] mb-6">
                  <li className="reveal-item reveal-feature flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#5356ff] text-[18px]">database</span>
                    <span>Tenant-isolated inventory</span>
                  </li>
                  <li className="reveal-item reveal-feature-2 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#5356ff] text-[18px]">deployed_code</span>
                    <span>Products and stock</span>
                  </li>
                  <li className="reveal-item reveal-feature-3 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#5356ff] text-[18px]">receipt_long</span>
                    <span>Orders and fulfillment</span>
                  </li>
                  <li className="reveal-item reveal-feature-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#5356ff] text-[18px]">group</span>
                    <span>Role-based access</span>
                  </li>
                </ul>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="reveal-item reveal-cta-late btn-hover text-white text-sm hover:text-[#2DD4BF] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>View workspace</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SCENE 3: ONBOARDING CTA
           ========================================================================= */}
        <div
          className={`absolute inset-0 pt-16 px-6 sm:px-12 max-w-4xl mx-auto flex flex-col justify-center items-center text-center transition-opacity duration-500 ease-out will-change-[opacity] ${
            activeScene === 3 || exitingScene === 3
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className={sceneRevealClass(3)}>
            <h2 className="reveal-item reveal-headline text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Supercharge your logistics with VAULT InventoryOS today.
            </h2>

            <p className="reveal-item reveal-paragraph text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
              Log in or sign up from the navigation above to enter your workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { NavigationPage } from '../../types';
import { VAULT_LOGO_URL, CURRENT_USER_AVATAR } from '../../data/mockData';

interface CinematicLandingProps {
  onNavigate: (page: NavigationPage) => void;
  onSceneChange?: (sceneIndex: number) => void;
}

export const CinematicLanding: React.FC<CinematicLandingProps> = ({
  onNavigate,
  onSceneChange,
}) => {
  const [activeScene, setActiveScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedModule, setSelectedModule] = useState(0);

  // Wheel accumulation for natural, butter-smooth inertial trackpad & mouse scrolling
  const wheelAccumulator = useRef(0);
  const touchStartY = useRef(0);
  const lastTransitionTime = useRef(0);
  const decayRaf = useRef<number | null>(null);

  const totalScenes = 4;

  const scenesMeta = [
    { id: 'deck', title: 'Command Deck', code: 'SCENE // 01', subtitle: 'Live Node Telemetry', accent: '#5356ff' },
    { id: 'modules', title: 'Architecture', code: 'SCENE // 02', subtitle: 'Distributed Core Engine', accent: '#a855f7' },
    { id: 'physical', title: 'Consensus', code: 'SCENE // 03', subtitle: 'Physical Warehouse Sync', accent: '#10B981' },
    { id: 'gateway', title: 'Access Portal', code: 'SCENE // 04', subtitle: 'Tenant Unit Deployment', accent: '#82cfff' },
  ];

  const goToScene = (index: number) => {
    if (index < 0 || index >= totalScenes || index === activeScene) return;

    const now = Date.now();
    // Smooth transition pacing
    if (now - lastTransitionTime.current < 600) return;

    lastTransitionTime.current = now;
    setIsTransitioning(true);
    setActiveScene(index);
    if (onSceneChange) onSceneChange(index);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 850);
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
          <img src={VAULT_LOGO_URL} alt="VAULT Logo" className="h-7 w-auto object-contain drop-shadow-[0_0_12px_rgba(83,86,255,0.6)]" />
          <div className="flex flex-col">
            <span className="font-semibold text-lg text-[#F1F5F9] tracking-tight leading-tight">VAULT</span>
            <span className="text-[10px] font-mono tracking-widest text-[#c0c1ff]">INVENTORYOS</span>
          </div>
        </div>

        {/* Scene Indicator in HUD with smooth transition */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono">
          {scenesMeta.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => goToScene(idx)}
              className={`flex items-center gap-2 py-1 transition-all duration-300 cursor-pointer ${
                activeScene === idx
                  ? 'text-white font-bold border-b-2 border-[#5356ff] translate-y-[-1px]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span>{sc.code}</span>
              <span className="hidden lg:inline text-[#64748B]">/ {sc.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-[#c0c1ff] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all border border-white/15 cursor-pointer backdrop-blur-md shadow-sm"
            title="Enter through the Locked Shutter"
          >
            <span className="material-symbols-outlined text-[15px]">lock</span>
            <span>Locked Shutter</span>
          </button>

          <button
            onClick={() => onNavigate('signup')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#5356ff] to-[#4142ee] hover:from-[#6467ff] hover:to-[#5152fa] text-white text-xs font-medium shadow-[0_0_20px_rgba(83,86,255,0.45)] hover:shadow-[0_0_28px_rgba(83,86,255,0.65)] transition-all cursor-pointer border border-white/15"
            title="Register and get assigned an apartment unit"
          >
            <span className="material-symbols-outlined text-[15px]">apartment</span>
            <span>Assign Unit</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="hidden sm:block ml-1 ring-1 ring-white/15 rounded-full hover:ring-[#5356ff] transition-all cursor-pointer shadow-md"
            title="Launch Dashboard Console"
          >
            <img src={CURRENT_USER_AVATAR} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          </button>
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
          className={`absolute inset-0 pt-16 px-6 sm:px-12 max-w-7xl mx-auto flex items-center transition-[opacity,transform,filter] duration-900 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-[transform,opacity] transform-gpu ${
            activeScene === 0
              ? 'opacity-100 scale-100 translate-y-0 blur-0 pointer-events-auto'
              : activeScene > 0
              ? 'opacity-0 scale-[0.96] -translate-y-12 blur-[1.5px] pointer-events-none'
              : 'opacity-0 scale-[1.04] translate-y-12 blur-[1.5px] pointer-events-none'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/15 text-[11px] font-mono text-[#c0c1ff] mb-5 backdrop-blur-xl shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span>UNIFIED MULTI-TENANT LOGISTICS LEDGER</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] mb-5">
                Inventory & Order Management for{' '}
                <span className="bg-gradient-to-r from-[#c0c1ff] via-[#82cfff] to-[#5356ff] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(83,86,255,0.4)]">
                  Modern Businesses
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-6 max-w-2xl">
                VAULT unifies high-frequency SKU logistics, stock adjustments, and multi-channel fulfillment on an immutable ledger. Scroll or glide through scenes below.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-6">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5356ff] to-[#4142ee] hover:from-[#6467ff] hover:to-[#5152fa] text-white font-medium text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(83,86,255,0.45)] hover:shadow-[0_0_30px_rgba(83,86,255,0.7)] transition-all cursor-pointer border border-white/15"
                >
                  <span className="material-symbols-outlined text-[16px]">lock_open</span>
                  <span>Enter via Locked Shutter</span>
                </button>

                <button
                  onClick={() => onNavigate('signup')}
                  className="px-5 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#82cfff]">apartment</span>
                  <span>Claim Building Unit</span>
                </button>

                <button
                  onClick={() => goToScene(1)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                >
                  <span>Explore Architecture</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                </button>
              </div>

              {/* Status Ticker */}
              <div className="flex items-center gap-4 text-xs font-mono text-[#94A3B8]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                  99.99% Ledger Consensus
                </span>
                <span className="text-white/20">/</span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#82cfff]">sync</span>
                  Zero-Drift Telemetry
                </span>
              </div>
            </div>

            {/* Right Live Node Card with Smooth Levitation */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-[#0E1424]/85 border border-white/15 backdrop-blur-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden animate-[float_7s_ease-in-out_infinite]">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-ping" />
                    <span className="font-mono text-xs text-[#F1F5F9] font-bold">
                      VAULT-NODE-01 // Acme Global Store
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    LIVE SYNC
                  </span>
                </div>

                {/* 2 Mini KPI Tiles */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/35 p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-[#94A3B8] block">Total Orders</span>
                    <div className="text-xl font-bold text-white mt-1 font-mono">124 (+12%)</div>
                    <div className="mt-2.5 h-4 w-full">
                      <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path
                          d="M 0 16 Q 25 12 50 8 T 100 2"
                          fill="none"
                          stroke="#82cfff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-black/35 p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-[#94A3B8] block">Active SKUs</span>
                    <div className="text-xl font-bold text-white mt-1 font-mono">356 (+8%)</div>
                    <div className="mt-2.5 flex justify-between text-[10px] font-mono text-[#64748B]">
                      <span>Capacity</span>
                      <span className="text-white font-bold">84.2%</span>
                    </div>
                  </div>
                </div>

                {/* Depletion Guard */}
                <div className="bg-black/35 p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-semibold text-[#F59E0B] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">warning</span>
                      Stock Depletion Guard
                    </span>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                      3 CRITICAL
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-white">
                      <span>Pro Studio Laptop M3</span>
                      <span className="font-mono text-[#EF4444] font-bold">3 left</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-white">
                      <span>Zero-Lag Ergonomic Mouse</span>
                      <span className="font-mono text-[#F59E0B] font-bold">5 left</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SCENE 1: ARCHITECTURAL MODULES (Transformed Environment)
           ========================================================================= */}
        <div
          className={`absolute inset-0 pt-16 px-6 sm:px-12 max-w-7xl mx-auto flex items-center transition-[opacity,transform,filter] duration-900 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-[transform,opacity] transform-gpu ${
            activeScene === 1
              ? 'opacity-100 scale-100 translate-y-0 blur-0 pointer-events-auto'
              : activeScene > 1
              ? 'opacity-0 scale-[0.96] -translate-y-12 blur-[1.5px] pointer-events-none'
              : 'opacity-0 scale-[1.04] translate-y-12 blur-[1.5px] pointer-events-none'
          }`}
        >
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="font-mono text-xs text-[#a855f7] uppercase tracking-wider block mb-1">
                  SCENE 02 // DISTRIBUTED ARCHITECTURE
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  High-velocity modular engine for multi-tenant zero-drift fulfillment.
                </h2>
              </div>
              <p className="text-xs text-[#94A3B8] max-w-sm">
                Each module runs isolated peer-to-peer consensus across warehouse boundaries.
              </p>
            </div>

            {/* 3 Interactive Module Perspective Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 0,
                  mod: 'MODULE 01',
                  title: 'Manage Products & SKUs',
                  desc: 'Variant matrices, multi-warehouse bins, and serial numbers. Automated reorder triggers notify procurement.',
                  icon: 'inventory_2',
                  accent: '#5356ff',
                  statLabel: 'Active Catalog',
                  statVal: '14,280 SKUs',
                },
                {
                  id: 1,
                  mod: 'MODULE 02',
                  title: 'Process Orders Seamlessly',
                  desc: 'From draft reservation to pick, pack, and automated dispatch. Never double-commit stock during demand surges.',
                  icon: 'receipt_long',
                  accent: '#82cfff',
                  statLabel: 'Order Lifecycle',
                  statVal: 'Draft → Shipped',
                },
                {
                  id: 2,
                  mod: 'MODULE 03',
                  title: 'Secure & Multi-Tenant',
                  desc: 'Complete physical and logical workspace isolation per tenant. Role-based granular permissions at row level.',
                  icon: 'hub',
                  accent: '#a855f7',
                  statLabel: 'Encryption',
                  statVal: 'AES-256 GCM',
                },
              ].map((m) => {
                const isSelected = selectedModule === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModule(m.id)}
                    className={`p-6 rounded-3xl border transition-all duration-500 cursor-pointer backdrop-blur-2xl shadow-xl ${
                      isSelected
                        ? 'bg-[#0E1424] border-[#a855f7]/60 shadow-[0_0_40px_rgba(168,85,247,0.3)] scale-[1.03] z-10'
                        : 'bg-[#0E1424]/60 border-white/10 hover:border-white/25 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: `${m.accent}25` }}
                      >
                        <span className="material-symbols-outlined text-[22px]" style={{ color: m.accent }}>
                          {m.icon}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-[#94A3B8] border border-white/10">
                        {m.mod}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{m.desc}</p>

                    <div className="bg-black/40 p-3 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94A3B8]">{m.statLabel}</span>
                      <span className="text-white font-bold" style={{ color: m.accent }}>
                        {m.statVal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            SCENE 2: PHYSICAL WAREHOUSE CONSENSUS
           ========================================================================= */}
        <div
          className={`absolute inset-0 pt-16 px-6 sm:px-12 max-w-7xl mx-auto flex items-center transition-[opacity,transform,filter] duration-900 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-[transform,opacity] transform-gpu ${
            activeScene === 2
              ? 'opacity-100 scale-100 translate-y-0 blur-0 pointer-events-auto'
              : activeScene > 2
              ? 'opacity-0 scale-[0.96] -translate-y-12 blur-[1.5px] pointer-events-none'
              : 'opacity-0 scale-[1.04] translate-y-12 blur-[1.5px] pointer-events-none'
          }`}
        >
          <div className="w-full rounded-3xl bg-[#0E1424]/85 border border-white/15 backdrop-blur-2xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <span className="font-mono text-xs text-[#10B981] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  SCENE 03 // PHYSICAL WAREHOUSE SYNCHRONIZATION
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Multi-node physical integration, engineered without bottlenecks.
                </h2>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-6">
                  Every inventory adjustment, cycle audit, and bulk consignment is signed with an immutable SHA-256 cryptographic proof to eliminate shrinkage disputes.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-2xl bg-black/35 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-white font-mono">4.8M+</div>
                    <div className="text-[11px] text-[#94A3B8] mt-1">Ledger Tx / Day</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/35 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-[#82cfff] font-mono">&lt; 35ms</div>
                    <div className="text-[11px] text-[#94A3B8] mt-1">Consensus Speed</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/35 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-[#10B981] font-mono">99.999%</div>
                    <div className="text-[11px] text-[#94A3B8] mt-1">Audit Precision</div>
                  </div>
                </div>
              </div>

              {/* Zone Alpha Terminal Preview */}
              <div className="lg:col-span-5">
                <div className="bg-black/50 border border-white/15 rounded-3xl p-5 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <span className="font-mono text-xs text-white font-bold">ZONE ALPHA // BAY 14-C</span>
                    <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-[#94A3B8]">Bin Audit Status</span>
                      <span className="font-mono text-[#10B981] font-bold">VERIFIED</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-[#94A3B8]">Last Barcode Scan</span>
                      <span className="font-mono text-white">11:42:09 UTC</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#94A3B8]">Operator Badge</span>
                      <span className="font-mono text-[#c0c1ff]">USR-89104 (Admin)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('stock-adjustments')}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>View Reconciliation Logs</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SCENE 3: ONBOARDING & DUAL PORTAL GATEWAYS
           ========================================================================= */}
        <div
          className={`absolute inset-0 pt-16 px-6 sm:px-12 max-w-4xl mx-auto flex flex-col justify-center items-center text-center transition-[opacity,transform,filter] duration-900 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-[transform,opacity] transform-gpu ${
            activeScene === 3
              ? 'opacity-100 scale-100 translate-y-0 blur-0 pointer-events-auto'
              : 'opacity-0 scale-[0.96] translate-y-12 blur-[1.5px] pointer-events-none'
          }`}
        >
          <span className="px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/15 text-[11px] font-mono text-[#82cfff] mb-4 backdrop-blur-xl shadow-lg">
            SCENE 04 // ENTERPRISE DEPLOYMENT
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Supercharge your logistics with VAULT InventoryOS today.
          </h2>

          <p className="text-sm text-[#94A3B8] max-w-xl mx-auto mb-8 leading-relaxed">
            Choose your gateway below: unlock the security blast shutter to enter, or request an apartment unit inside our building cluster.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-lg mb-8">
            {/* Shutter Login Card */}
            <div
              onClick={() => onNavigate('login')}
              className="p-6 rounded-3xl bg-black/40 border border-white/15 hover:border-[#5356ff]/80 transition-all duration-300 cursor-pointer group text-left shadow-2xl backdrop-blur-xl hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="material-symbols-outlined text-[26px] text-[#5356ff] group-hover:scale-110 transition-transform">
                  lock
                </span>
                <span className="font-mono text-[9px] text-[#94A3B8] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                  LOCKED SHUTTER
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#c0c1ff] transition-colors">
                Sign In
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                Disengage the physical blast gate and access your existing tenant node.
              </p>
            </div>

            {/* Building Signup Card */}
            <div
              onClick={() => onNavigate('signup')}
              className="p-6 rounded-3xl bg-black/40 border border-white/15 hover:border-[#82cfff]/80 transition-all duration-300 cursor-pointer group text-left shadow-2xl backdrop-blur-xl hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="material-symbols-outlined text-[26px] text-[#82cfff] group-hover:scale-110 transition-transform">
                  apartment
                </span>
                <span className="font-mono text-[9px] text-[#10B981] px-2 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30">
                  ASSIGN UNIT
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#82cfff] transition-colors">
                Register Workspace
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                Claim a dedicated apartment unit inside the decentralized tower.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-mono text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1"
          >
            <span>Or bypass directly to Live Admin Console</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FIXED BOTTOM HUD & SILKY SCENE TIMELINE CONTROLS                       */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-6 left-6 right-6 z-40 flex items-center justify-between text-xs font-mono text-[#94A3B8] pointer-events-none">
        {/* Left: Scroll hints with smooth float icon */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-[#080B11]/75 backdrop-blur-2xl px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          <span className="material-symbols-outlined text-[17px] text-[#82cfff] animate-[float_3s_ease-in-out_infinite]">
            unfold_more
          </span>
          <span className="text-[11px] hidden sm:inline">Scroll or use arrows to glide between scenes</span>
          <span className="text-[11px] sm:hidden">Swipe or tap dots</span>
        </div>

        {/* Center: Interactive scene progress pills */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-[#080B11]/80 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/15 shadow-xl">
          {scenesMeta.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => goToScene(idx)}
              className="flex items-center gap-2 group cursor-pointer p-0.5"
              title={`Jump to ${sc.title}`}
            >
              <span
                className={`h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                  activeScene === idx
                    ? 'w-7 shadow-[0_0_12px_rgba(83,86,255,0.8)]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                style={{
                  backgroundColor: activeScene === idx ? sc.accent : undefined,
                }}
              />
            </button>
          ))}
        </div>

        {/* Right: Active scene indicator badge & Quick Next/Prev */}
        <div className="pointer-events-auto flex items-center gap-2">
          {activeScene > 0 && (
            <button
              onClick={() => goToScene(activeScene - 1)}
              className="w-8 h-8 rounded-full bg-[#080B11]/80 hover:bg-[#080B11] border border-white/15 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 backdrop-blur-xl shadow-md"
              title="Previous Scene"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            </button>
          )}

          {activeScene < totalScenes - 1 && (
            <button
              onClick={() => goToScene(activeScene + 1)}
              className="w-8 h-8 rounded-full bg-[#080B11]/80 hover:bg-[#080B11] border border-white/15 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 backdrop-blur-xl shadow-md"
              title="Next Scene"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 bg-[#080B11]/75 backdrop-blur-2xl px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
            <span className="text-white font-bold">{scenesMeta[activeScene].code}</span>
            <span className="text-[#64748B]">/</span>
            <span style={{ color: scenesMeta[activeScene].accent }}>{scenesMeta[activeScene].subtitle}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

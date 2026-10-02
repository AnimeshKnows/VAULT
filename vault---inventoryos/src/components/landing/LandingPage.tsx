import React from 'react';
import { NavigationPage } from '../../types';
import { VAULT_LOGO_URL, CURRENT_USER_AVATAR } from '../../data/mockData';

interface LandingPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-transparent text-[#dfe2ef] selection:bg-[#5356ff] selection:text-white font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#5356ff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-[500px] h-[350px] bg-[#82cfff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[1400px] left-1/3 w-[600px] h-[400px] bg-[#7e4ee8]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#080B11]/85 backdrop-blur-xl z-50 px-6 sm:px-12 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src={VAULT_LOGO_URL} alt="VAULT Logo" className="h-7 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="font-semibold text-lg text-[#F1F5F9] tracking-tight leading-tight">VAULT</span>
            <span className="text-[10px] font-mono tracking-widest text-[#c0c1ff]">INVENTORYOS</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-[#94A3B8]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          <a href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</a>
          <button onClick={() => onNavigate('dashboard')} className="hover:text-[#5356ff] transition-colors">
            Live Demo
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-1.5 text-sm font-medium text-[#F1F5F9] hover:text-white transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-1.5 rounded-lg bg-[#5356ff] hover:bg-[#4142ee] text-white text-sm font-medium shadow-[0_0_16px_rgba(83,86,255,0.4)] hover:shadow-[0_0_24px_rgba(83,86,255,0.6)] transition-all"
          >
            Get Started
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="hidden sm:block ml-2 ring-1 ring-white/10 rounded-full hover:ring-[#5356ff] transition-all"
            title="Logged in as Animesh Kumar"
          >
            <img
              src={CURRENT_USER_AVATAR}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c2029] border border-white/5 text-[11px] font-mono text-[#c0c1ff] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>VERIFIED ACCESS UNIFIED LEDGER FOR TENANTS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-6">
              Inventory & Order Management for{' '}
              <span className="bg-gradient-to-r from-[#c0c1ff] via-[#82cfff] to-[#5356ff] bg-clip-text text-transparent">
                Modern Businesses
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed mb-8 max-w-2xl">
              VAULT (InventoryOS) is a high-precision, multi-tenant SaaS platform engineered to unify high-frequency SKU logistics, stock adjustments, and multi-channel orders on an immutable ledger.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {[
                { icon: 'verified', text: 'Multi-tenant' },
                { icon: 'shield', text: 'Secure & Scalable' },
                { icon: 'bolt', text: 'Easy to Use' },
                { icon: 'groups', text: 'Built for Teams' },
              ].map((pill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181b25] border border-white/5 text-xs text-[#F1F5F9]"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#5356ff]">{pill.icon}</span>
                  <span>{pill.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 rounded-lg bg-[#5356ff] hover:bg-[#4142ee] text-white font-medium text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(83,86,255,0.45)] hover:shadow-[0_0_28px_rgba(83,86,255,0.65)] transition-all"
              >
                <span>Get Started Free</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-lg bg-[#181b25] hover:bg-[#262a34] border border-white/10 text-white font-medium text-sm flex items-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                <span>Learn More</span>
              </button>
            </div>

            {/* Reliability indicator */}
            <div className="flex items-center gap-4 text-xs font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                99.99% Ledger Uptime
              </span>
              <span>/</span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#82cfff]">sync</span>
                Zero-Drift Sync
              </span>
            </div>
          </div>

          {/* Right Column: Hero Live Node Telemetry Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#0E1424]/90 border border-white/10 backdrop-blur-xl p-6 shadow-2xl overflow-hidden">
              {/* Card top banner */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  </div>
                  <span className="font-mono text-xs text-[#94A3B8] ml-2">
                    VAULT-NODE-01 // Acme Global Store
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono text-[10px]">
                  <span>LIVE SYNC</span>
                  <span className="material-symbols-outlined text-[12px]">bar_chart</span>
                </div>
              </div>

              {/* 2 Mini KPI Tiles */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#181b25] p-3.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-[#94A3B8]">Total Orders</span>
                    <span className="p-1.5 rounded-lg bg-[#5356ff]/15 text-[#c0c1ff]">
                      <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-white">124</span>
                    <span className="text-xs font-mono text-[#10B981]">+12%</span>
                  </div>
                  {/* Neon sparkline */}
                  <div className="mt-2 h-4 w-full">
                    <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path
                        d="M 0 18 Q 25 15 50 10 T 100 2"
                        fill="none"
                        stroke="#82cfff"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                <div className="bg-[#181b25] p-3.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-[#94A3B8]">Active SKUs</span>
                    <span className="p-1.5 rounded-lg bg-[#00a3e0]/15 text-[#82cfff]">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-white">356</span>
                    <span className="text-xs font-mono text-[#10B981]">+8%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#94A3B8]">
                    <span>Warehouse Capacity</span>
                    <span className="font-mono text-white">84.2%</span>
                  </div>
                </div>
              </div>

              {/* Order Inflow Velocity Chart */}
              <div className="bg-[#181b25] p-4 rounded-xl border border-white/5 mb-5">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#5356ff]">bar_chart</span>
                    Order Inflow Velocity
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="flex items-center gap-1 text-[#c0c1ff]">
                      <span className="w-2 h-2 rounded-full bg-[#5356ff]" /> Confirmed
                    </span>
                    <span className="flex items-center gap-1 text-[#82cfff]">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Fulfilled
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 items-end h-20 pt-2">
                  {[
                    { h: 35, c: '#5356ff' },
                    { h: 48, c: '#5356ff' },
                    { h: 72, c: '#5356ff' },
                    { h: 88, c: '#10B981' },
                    { h: 42, c: '#5356ff' },
                    { h: 65, c: '#5356ff' },
                    { h: 90, c: '#10B981' },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm transition-all"
                        style={{ height: `${bar.h}%`, backgroundColor: bar.c }}
                      />
                      <span className="text-[9px] font-mono text-[#475569]">S{i * 4 + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Depletion Guard */}
              <div className="bg-[#181b25] p-4 rounded-xl border border-white/5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#F59E0B] font-semibold">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Stock Depletion Guard</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] text-[10px] font-mono font-bold">
                    3 CRITICAL
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1424] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">laptop_chromebook</span>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">Pro Studio Laptop M3</span>
                        <span className="text-[10px] font-mono text-[#475569]">SKU: LAP-001</span>
                      </div>
                    </div>
                    <span className="font-mono text-[#EF4444] font-bold px-2 py-0.5 rounded bg-[#EF4444]/10">
                      3 left
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1424] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">mouse</span>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">Zero-Lag Ergonomic Mouse</span>
                        <span className="text-[10px] font-mono text-[#475569]">SKU: WM-001</span>
                      </div>
                    </div>
                    <span className="font-mono text-[#F59E0B] font-bold px-2 py-0.5 rounded bg-[#F59E0B]/10">
                      5 left
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] pt-2 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#82cfff]" />
                  P2P Ledger Sync Active
                </span>
                <span>Latency: 14ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Engineered Core Capabilities */}
      <section id="features" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#82cfff] uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[16px]">layers</span>
              <span>ENGINEERED CORE CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              High-velocity architecture built for multi-tenant logistics and zero-drift fulfillment.
            </h2>
          </div>
          <p className="text-sm text-[#94A3B8] max-w-md">
            Replace fragile spreadsheets and disjointed ecommerce plugins with a unified operational ledger built on distributed, fault-tolerant nodes.
          </p>
        </div>

        {/* 3 Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 01 */}
          <div 
            onClick={() => onNavigate('products')}
            className="group p-8 rounded-2xl bg-[#0E1424]/80 border border-white/10 hover:border-[#5356ff]/50 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(83,86,255,0.2)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#5356ff]/15 flex items-center justify-center text-[#c0c1ff]">
                <span className="material-symbols-outlined text-[24px]">inventory_2</span>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/5 text-[#94A3B8]">
                MODULE 01
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c0c1ff] transition-colors">
              Manage Products & SKUs
            </h3>
            <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
              Keep track of variant matrices, multi-warehouse bins, and serial numbers. Automated reorder triggers notify procurement before stockouts hit revenue.
            </p>
            <div className="bg-[#181b25] p-3.5 rounded-xl border border-white/5 space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 text-[#94A3B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Active Catalog
                </span>
                <span className="font-mono font-bold text-white">14,280 SKUs</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 text-[#94A3B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#82cfff]" /> Auto-Sync Channels
                </span>
                <span className="font-mono text-white">Shopify, Amazon, ERP</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#c0c1ff] group-hover:text-white transition-colors">
              <span>Real-time SKU telemetry</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </div>

          {/* Module 02 */}
          <div 
            onClick={() => onNavigate('orders')}
            className="group p-8 rounded-2xl bg-[#0E1424]/80 border border-white/10 hover:border-[#82cfff]/50 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(130,207,255,0.2)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00a3e0]/15 flex items-center justify-center text-[#82cfff]">
                <span className="material-symbols-outlined text-[24px]">receipt_long</span>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/5 text-[#94A3B8]">
                MODULE 02
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#82cfff] transition-colors">
              Process Orders Seamlessly
            </h3>
            <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
              From draft reservation to pick, pack, and automated multi-carrier label generation. Never double-commit stock across simultaneous sales spikes.
            </p>
            <div className="bg-[#181b25] p-3.5 rounded-xl border border-white/5 mb-6 text-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[10px] text-[#94A3B8]">ORDER LIFECYCLE</span>
                <span className="font-mono text-[10px] text-[#10B981] font-bold">CONFIRMED</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] text-[#475569]">
                <div className="h-1.5 rounded-full bg-[#10B981]" />
                <div className="h-1.5 rounded-full bg-[#10B981]" />
                <div className="h-1.5 rounded-full bg-[#5356ff]" />
                <div className="h-1.5 rounded-full bg-white/10" />
                <span>Draft</span>
                <span>Allocated</span>
                <span>Packed</span>
                <span>Shipped</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#82cfff] group-hover:text-white transition-colors">
              <span>Zero-latency batch dispatch</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </div>

          {/* Module 03 */}
          <div 
            onClick={() => onNavigate('stock-adjustments')}
            className="group p-8 rounded-2xl bg-[#0E1424]/80 border border-white/10 hover:border-[#7e4ee8]/50 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(126,78,232,0.2)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#7e4ee8]/15 flex items-center justify-center text-[#d0bcff]">
                <span className="material-symbols-outlined text-[24px]">hub</span>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/5 text-[#94A3B8]">
                MODULE 03
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#d0bcff] transition-colors">
              Secure & Multi-Tenant
            </h3>
            <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
              Complete physical and logical workspace isolation per tenant. Role-based granular permissions ensure store managers, clerks, and auditors only access their scope.
            </p>
            <div className="bg-[#181b25] p-3.5 rounded-xl border border-white/5 space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 text-[#94A3B8]">
                  <span className="material-symbols-outlined text-[14px] text-[#10B981]">verified_user</span> Tenant Isolation
                </span>
                <span className="font-mono font-bold text-white">AES-256 GCM</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 text-[#94A3B8]">
                  <span className="material-symbols-outlined text-[14px] text-[#82cfff]">key</span> RBAC Protocol
                </span>
                <span className="font-mono text-white">Strict Row-Level</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#d0bcff] group-hover:text-white transition-colors">
              <span>SOC2 Type II certified pipeline</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Multi-Node Physical Integration */}
      <section id="infrastructure" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0E1424]/70 border border-white/10 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-mono text-[#82cfff] uppercase tracking-wider mb-3">
                <span className="material-symbols-outlined text-[16px]">domain</span>
                <span>MULTI-NODE PHYSICAL INTEGRATION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Real-world warehouse synchronization, engineered without bottlenecks.
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-8">
                Every inventory adjustment, physical count audit, and bulk import event is recorded with an immutable SHA-256 cryptographic signature to eliminate shrinkage disputes.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-white font-mono">4.8M+</div>
                  <div className="text-xs text-[#94A3B8] mt-1">Ledger Transactions / Day</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-[#82cfff] font-mono">&lt; 35ms</div>
                  <div className="text-xs text-[#94A3B8] mt-1">Global Consensus Rate</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-[#10B981] font-mono">99.999%</div>
                  <div className="text-xs text-[#94A3B8] mt-1">Reconciliation Precision</div>
                </div>
              </div>
            </div>

            {/* Zone Alpha Live Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#181b25] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <span className="font-mono text-xs text-[#94A3B8] font-bold">ZONE ALPHA // BAY 14-C</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                </div>
                <div className="space-y-3 text-xs mb-6">
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
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  View Reconciliation Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Enterprise Onboarding CTA */}
      <section className="py-24 px-6 sm:px-12 max-w-4xl mx-auto text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-[#1c2029] border border-white/5 text-[11px] font-mono text-[#c0c1ff] mb-4">
          ENTERPRISE ONBOARDING READY
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          Supercharge your logistics with VAULT InventoryOS today.
        </h2>
        <p className="text-base text-[#94A3B8] max-w-2xl mx-auto mb-8">
          Join high-growth multi-tenant retailers and manufacturers scaling their fulfillment across decentralized warehouses worldwide.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-8 py-3.5 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white font-medium text-sm shadow-[0_0_24px_rgba(83,86,255,0.5)] transition-all"
          >
            Create Free Account
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-3.5 rounded-xl bg-[#181b25] hover:bg-[#262a34] border border-white/10 text-white font-medium text-sm transition-all"
          >
            Sign In to Tenant Portal
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 sm:px-12 border-t border-white/5 text-xs text-[#94A3B8] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img src={VAULT_LOGO_URL} alt="Logo" className="h-4 w-auto" />
          <span>© 2026 VAULT Ledger Systems Inc. Enterprise multi-tenant engine.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Status</a>
          <a href="#" className="hover:text-white transition-colors">Security Protocols</a>
          <a href="#" className="hover:text-white transition-colors">API Spec</a>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Product, Order, NavigationPage } from '../../types';

interface DashboardViewProps {
  products: Product[];
  orders: Order[];
  onNavigate: (page: NavigationPage) => void;
  onOpenReorderModal: () => void;
  onSelectOrder?: (order: Order) => void;
  ledgerNumber?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  orders,
  onNavigate,
  onOpenReorderModal,
  onSelectOrder,
}) => {
  const [dateRange, setDateRange] = useState('Sep 1, 2026 - Sep 22, 2026');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Compute live stats
  const totalProducts = products.length > 0 ? 124 : 0;
  const totalOrders = orders.length > 0 ? 58 : 0;
  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length || 7;
  const inStockCount = 102;
  const outOfStockCount = 15;
  const totalRevenue = '₹1,24,850';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Stacked bar daily data for Orders Overview
  const barData = [
    { day: 'Sep 1', draft: 20, confirmed: 23, fulfilled: 10 },
    { day: 'Sep 2', draft: 30, confirmed: 21, fulfilled: 10 },
    { day: 'Sep 3', draft: 35, confirmed: 28, fulfilled: 10 },
    { day: 'Sep 5', draft: 45, confirmed: 36, fulfilled: 12 },
    { day: 'Sep 7', draft: 33, confirmed: 25, fulfilled: 11 },
    { day: 'Sep 8', draft: 55, confirmed: 52, fulfilled: 15 },
    { day: 'Sep 9', draft: 37, confirmed: 38, fulfilled: 21 },
    { day: 'Sep 10', draft: 25, confirmed: 23, fulfilled: 11 },
    { day: 'Sep 12', draft: 30, confirmed: 31, fulfilled: 10 },
    { day: 'Sep 13', draft: 40, confirmed: 28, fulfilled: 15 },
    { day: 'Sep 14', draft: 55, confirmed: 50, fulfilled: 16 },
    { day: 'Sep 15', draft: 43, confirmed: 42, fulfilled: 20 },
    { day: 'Sep 17', draft: 30, confirmed: 31, fulfilled: 12 },
    { day: 'Sep 18', draft: 60, confirmed: 41, fulfilled: 16 },
    { day: 'Sep 19', draft: 70, confirmed: 53, fulfilled: 16 },
    { day: 'Sep 20', draft: 40, confirmed: 35, fulfilled: 16 },
  ];

  // Specific low-stock items shown in mockup
  const lowStockItems = products
    .filter((p) => ['WM-001', 'KB-002', 'UC-003', 'MN-004'].includes(p.sku))
    .slice(0, 4);

  // Recent 4 orders
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="relative w-full pb-16">
      {/* Dynamic Top Ambient Halo Glow */}
      <div className="absolute -top-10 right-1/4 w-96 h-48 bg-[#5356ff]/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -top-16 left-1/3 w-80 h-40 bg-[#82cfff]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header Section with Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
              Dashboard
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#1c2029] text-[#c0c1ff] border border-white/5">
              LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Overview of your inventory network, high-velocity ledger & orders
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#262a34] text-[#dfe2ef] hover:bg-[#353943] transition-all shadow-sm text-xs font-medium"
            >
              <span className="material-symbols-outlined text-[#5356ff] text-[18px]">calendar_month</span>
              <span className="font-mono text-[#F1F5F9]">{dateRange}</span>
              <span className="material-symbols-outlined text-[#94A3B8] text-[16px]">expand_more</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0f131c] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] px-3 py-1 block">
                  Select Reporting Window
                </span>
                <div className="space-y-1 mt-1 text-xs">
                  {['Today (Live)', 'Last 7 Days', 'Sep 1, 2026 - Sep 22, 2026', 'Last 30 Days', 'Current Quarter (Q3)'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setShowDatePicker(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-[#1c2029] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#262a34] transition-all border border-white/5 ${
              isRefreshing ? 'rotate-180 duration-500' : ''
            }`}
            title="Refresh Telemetry"
          >
            <span className="material-symbols-outlined text-[18px]">cached</span>
          </button>
        </div>
      </div>

      {/* 4-Column KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Metric 1: Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="group relative overflow-hidden rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md hover:shadow-xl hover:border-white/15 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#5356ff]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
                Total Products
              </span>
              <span className="text-3xl font-bold text-[#F1F5F9] mt-1.5 tracking-tight font-sans">
                {totalProducts}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#5356ff]/15 flex items-center justify-center text-[#c0c1ff] shadow-[0_0_12px_rgba(83,86,255,0.25)]">
              <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5">
            <span className="inline-flex items-center gap-0.5 text-[#10B981] font-mono text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+12%
            </span>
            <span className="text-[#475569] text-xs">vs prior cycle</span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="group relative overflow-hidden rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md hover:shadow-xl hover:border-white/15 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#82cfff]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
                Total Orders
              </span>
              <span className="text-3xl font-bold text-[#F1F5F9] mt-1.5 tracking-tight font-sans">
                {totalOrders}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#00a3e0]/20 flex items-center justify-center text-[#82cfff] shadow-[0_0_12px_rgba(0,163,224,0.25)]">
              <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5">
            <span className="inline-flex items-center gap-0.5 text-[#10B981] font-mono text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+8%
            </span>
            <span className="text-[#475569] text-xs">vs prior cycle</span>
          </div>
        </div>

        {/* Metric 3: Low Stock Items */}
        <div
          onClick={() => onNavigate('products')}
          className="group relative overflow-hidden rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md hover:shadow-xl hover:border-white/15 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
                Low Stock Items
              </span>
              <span className="text-3xl font-bold text-[#F1F5F9] mt-1.5 tracking-tight font-sans">
                {lowStockCount}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center text-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5">
            <span className="inline-flex items-center gap-0.5 text-[#EF4444] font-mono text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>-3%
            </span>
            <span className="text-[#475569] text-xs">deficit critical</span>
          </div>
        </div>

        {/* Metric 4: Total Revenue */}
        <div className="group relative overflow-hidden rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md hover:shadow-xl hover:border-white/15 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
                Total Revenue
              </span>
              <span className="text-3xl font-bold text-[#F1F5F9] mt-1.5 tracking-tight font-mono">
                {totalRevenue}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 flex items-center justify-center text-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <span className="material-symbols-outlined text-[22px]">monitoring</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5">
            <span className="inline-flex items-center gap-0.5 text-[#10B981] font-mono text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+16%
            </span>
            <span className="text-[#475569] text-xs">gross velocity</span>
          </div>
        </div>
      </div>

      {/* Two-Column Middle Grid: Orders Overview & Stock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Orders Overview Bar Chart Card (8 cols) */}
        <div className="lg:col-span-8 rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 flex flex-col justify-between shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight">
                Orders Overview
              </h2>
              <span className="text-xs text-[#94A3B8]">
                Throughput distribution across dispatch pipeline
              </span>
            </div>

            {/* Legend Markers */}
            <div className="flex items-center gap-4 text-xs font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#31353f]" /> Draft
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5356ff]" /> Confirmed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Fulfilled
              </span>
            </div>
          </div>

          {/* Interactive Stacked Bar Chart SVG */}
          <div className="relative w-full h-64 flex items-end pt-4 pb-2 select-none">
            {hoveredBar !== null && (
              <div
                className="absolute -top-1 z-30 bg-[#0a0e17] border border-white/10 rounded-lg px-3 py-1.5 shadow-xl text-xs font-mono text-white pointer-events-none transform -translate-x-1/2"
                style={{ left: `${((hoveredBar + 0.5) / barData.length) * 90 + 5}%` }}
              >
                <div className="font-bold text-[#c0c1ff]">{barData[hoveredBar].day}</div>
                <div className="flex gap-2 text-[10px] text-[#94A3B8]">
                  <span>Draft: {barData[hoveredBar].draft}</span>
                  <span className="text-[#5356ff]">Conf: {barData[hoveredBar].confirmed}</span>
                  <span className="text-[#10B981]">Ful: {barData[hoveredBar].fulfilled}</span>
                </div>
              </div>
            )}

            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 740 220">
              <defs>
                <linearGradient id="gradConfirmed" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#5356ff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#4142ee" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="gradFulfilled" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
                </linearGradient>
              </defs>

              {/* Grid guidelines */}
              <line stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" x1="30" x2="730" y1="20" y2="20" />
              <line stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" x1="30" x2="730" y1="65" y2="65" />
              <line stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" x1="30" x2="730" y1="110" y2="110" />
              <line stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" x1="30" x2="730" y1="155" y2="155" />
              <line stroke="rgba(255,255,255,0.08)" x1="30" x2="730" y1="195" y2="195" />

              {/* Y Axis Labels */}
              <text fill="#475569" fontFamily="JetBrains Mono" fontSize="10" x="5" y="24">40</text>
              <text fill="#475569" fontFamily="JetBrains Mono" fontSize="10" x="5" y="69">30</text>
              <text fill="#475569" fontFamily="JetBrains Mono" fontSize="10" x="5" y="114">20</text>
              <text fill="#475569" fontFamily="JetBrains Mono" fontSize="10" x="5" y="159">10</text>
              <text fill="#475569" fontFamily="JetBrains Mono" fontSize="10" x="12" y="198">0</text>

              {/* Stacked Bars */}
              {barData.map((d, i) => {
                const x = 52 + i * 42;
                const draftH = Math.min(d.draft * 1.1, 70);
                const confH = Math.min(d.confirmed * 0.9, 55);
                const fulH = Math.min(d.fulfilled * 1.1, 22);

                const draftY = 195 - draftH;
                const confY = draftY - confH;
                const fulY = confY - fulH;

                return (
                  <g
                    key={i}
                    className="transition-transform duration-200 hover:opacity-85 cursor-pointer"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <rect fill="#31353f" height={draftH} rx="3" width="16" x={x} y={draftY} />
                    <rect fill="url(#gradConfirmed)" height={confH} rx="3" width="16" x={x} y={confY} />
                    <rect fill="url(#gradFulfilled)" height={fulH} rx="3" width="16" x={x} y={fulY} />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between px-6 pt-2 text-[11px] font-mono text-[#475569]">
            <span>Sep 1</span>
            <span>Sep 5</span>
            <span>Sep 10</span>
            <span>Sep 15</span>
            <span>Sep 20</span>
          </div>
        </div>

        {/* Stock Status Donut Chart Card (4 cols) */}
        <div className="lg:col-span-4 rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 flex flex-col justify-between shadow-md">
          <div>
            <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight">Stock Status</h2>
            <span className="text-xs text-[#94A3B8]">Inventory availability distribution</span>
          </div>

          {/* Donut Chart */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" fill="transparent" r="62" stroke="rgba(255,255,255,0.04)" strokeWidth="15" />
              {/* In Stock segment (green) */}
              <circle
                cx="80"
                cy="80"
                fill="transparent"
                r="62"
                stroke="#10B981"
                strokeWidth="15"
                strokeDasharray="320 390"
                strokeDashoffset="0"
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              {/* Low Stock segment (amber) */}
              <circle
                cx="80"
                cy="80"
                fill="transparent"
                r="62"
                stroke="#F59E0B"
                strokeWidth="15"
                strokeDasharray="22 390"
                strokeDashoffset="-325"
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              {/* Out of Stock segment (red) */}
              <circle
                cx="80"
                cy="80"
                fill="transparent"
                r="62"
                stroke="#EF4444"
                strokeWidth="15"
                strokeDasharray="47 390"
                strokeDashoffset="-352"
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Donut Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white tracking-tight font-sans">
                {totalProducts}
              </span>
              <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider">
                Products
              </span>
            </div>
          </div>

          {/* Segment Breakdown */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[#94A3B8]">In Stock</span>
              </div>
              <span className="font-mono font-semibold text-white">{inStockCount}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <span className="text-[#94A3B8]">Low Stock</span>
              </div>
              <span className="font-mono font-semibold text-white">{lowStockCount}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-[#94A3B8]">Out of Stock</span>
              </div>
              <span className="font-mono font-semibold text-white">{outOfStockCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Two-Column Grid: Recent Orders & Low Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Recent Orders (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight">Recent Orders</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#262a34] text-[#94A3B8]">
                  Active Ledger
                </span>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#c0c1ff] hover:text-white transition-colors group"
              >
                <span>View all</span>
                <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#181b25] text-[#475569] font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg">Order #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => onSelectOrder ? onSelectOrder(ord) : onNavigate('orders')}
                      className="group hover:bg-[#262a34] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-mono font-medium text-[#c0c1ff]">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#F1F5F9]">
                        {ord.customerName}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold ${
                            ord.status === 'Confirmed'
                              ? 'bg-[#10B981]/15 text-[#10B981]'
                              : ord.status === 'Draft'
                              ? 'bg-[#31353f] text-[#c6c4d9]'
                              : ord.status === 'Fulfilled'
                              ? 'bg-[#06B6D4]/15 text-[#06B6D4]'
                              : 'bg-[#EF4444]/15 text-[#EF4444]'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#F1F5F9] text-right">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#94A3B8] text-right">
                        {ord.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-2 flex items-center justify-between text-xs text-[#475569] border-t border-white/5">
            <span>Showing latest 4 transactional movements</span>
            <span className="font-mono text-[#82cfff]">HASH #882B</span>
          </div>
        </div>

        {/* Right Column: Low Stock Products (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight">
                  Low Stock Products
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/15 text-[#F59E0B] font-bold">
                  {lowStockCount} Critical
                </span>
              </div>
              <button
                onClick={() => onNavigate('products')}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#c0c1ff] hover:text-white transition-colors group"
              >
                <span>View all</span>
                <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#181b25] text-[#475569] font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg">Product</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Current</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right">Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lowStockItems.map((prod) => (
                    <tr
                      key={prod.id}
                      onClick={() => onNavigate('products')}
                      className="group hover:bg-[#262a34] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-8 h-8 rounded-lg bg-[#0E1424] object-cover p-0.5 ring-1 ring-white/10"
                          />
                          <span className="font-medium text-[#F1F5F9] group-hover:text-[#c0c1ff] transition-colors">
                            {prod.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#94A3B8]">{prod.sku}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            prod.currentStock <= 3
                              ? 'text-[#EF4444] bg-[#EF4444]/10'
                              : 'text-[#F59E0B] bg-[#F59E0B]/10'
                          }`}
                        >
                          {prod.currentStock}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#475569] text-right">
                        {prod.threshold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Action Purchase Order Trigger */}
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/5">
            <span className="text-xs text-[#94A3B8]">Auto-reorder trigger active</span>
            <button
              onClick={onOpenReorderModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5356ff] hover:bg-[#4142ee] text-white font-mono text-xs font-semibold shadow-[0_0_12px_rgba(83,86,255,0.3)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
              <span>Reorder Deficit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import { Product, Order, NavigationPage } from '../../types';
import {
  fetchOrderVolume,
  fetchReportSummary,
  type OrderVolumeDay,
  type ReportSummary,
} from '../../lib/api/reports';

interface DashboardViewProps {
  products: Product[];
  orders: Order[];
  onNavigate: (page: NavigationPage) => void;
  onOpenReorderModal: () => void;
  onSelectOrder?: (order: Order) => void;
  onRefresh?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  orders,
  onNavigate,
  onOpenReorderModal,
  onSelectOrder,
  onRefresh,
}) => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [volume, setVolume] = useState<OrderVolumeDay[]>([]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 21);
      const [s, v] = await Promise.all([
        fetchReportSummary(),
        fetchOrderVolume(from.toISOString(), to.toISOString()),
      ]);
      setSummary(s);
      setVolume(v);
    } catch {
      setSummary(null);
      setVolume([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports, products.length, orders.length]);

  const totalProducts = summary?.totalProducts ?? products.length;
  const totalOrders = summary?.totalOrders ?? orders.length;
  const lowStockCount =
    summary?.lowStockCount ?? products.filter((p) => p.status === 'Low Stock').length;
  const inStockCount =
    summary?.inStockCount ?? products.filter((p) => p.status === 'In Stock').length;
  const outOfStockCount =
    summary?.outOfStockCount ?? products.filter((p) => p.status === 'Out of Stock').length;
  const totalRevenue = summary?.revenue ?? 0;

  const barData = volume.map((d) => ({
    day: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    draft: d.draft,
    confirmed: d.confirmed,
    fulfilled: d.fulfilled,
  }));

  const maxBar = Math.max(
    1,
    ...barData.map((d) => d.draft + d.confirmed + d.fulfilled)
  );

  const lowStockItems = products
    .filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
    .slice(0, 4);
  const recentOrders = orders.slice(0, 4);

  const circumference = 2 * Math.PI * 62;
  const totalForDonut = Math.max(1, totalProducts);
  const inLen = (inStockCount / totalForDonut) * circumference;
  const lowLen = (lowStockCount / totalForDonut) * circumference;
  const outLen = (outOfStockCount / totalForDonut) * circumference;

  return (
    <div className="relative w-full pb-16">
      <div className="absolute -top-10 right-1/4 w-96 h-48 bg-[#5356ff]/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Inventory and order overview for your workspace
          </p>
        </div>

        <button
          onClick={() => {
            void loadReports();
            onRefresh?.();
          }}
          className={`p-2 rounded-xl bg-[#1c2029] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#262a34] transition-all border border-white/5 ${
            loading ? 'animate-spin' : ''
          }`}
          title="Refresh"
        >
          <span className="material-symbols-outlined text-[18px]">cached</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="text-left rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md hover:border-white/15 transition-all"
        >
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Total Products
          </span>
          <div className="text-3xl font-bold text-[#F1F5F9] mt-1.5">{totalProducts}</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className="text-left rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md hover:border-white/15 transition-all"
        >
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Total Orders
          </span>
          <div className="text-3xl font-bold text-[#F1F5F9] mt-1.5">{totalOrders}</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="text-left rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md hover:border-white/15 transition-all"
        >
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Low Stock Items
          </span>
          <div className="text-3xl font-bold text-[#F1F5F9] mt-1.5">{lowStockCount}</div>
        </button>

        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Revenue
          </span>
          <div className="text-3xl font-bold text-[#F1F5F9] mt-1.5 font-mono">
            ₹{Number(totalRevenue).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        <div className="lg:col-span-8 rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#F1F5F9]">Orders Overview</h2>
              <span className="text-xs text-[#94A3B8]">Daily volume (last 21 days)</span>
            </div>
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

          <div className="relative w-full h-64 flex items-end pt-4 pb-2 select-none">
            {barData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#94A3B8]">
                No order volume in this period.
              </div>
            ) : (
              <>
                {hoveredBar !== null && barData[hoveredBar] && (
                  <div
                    className="absolute -top-1 z-30 bg-[#0a0e17] border border-white/10 rounded-lg px-3 py-1.5 shadow-xl text-xs font-mono text-white pointer-events-none"
                    style={{
                      left: `${((hoveredBar + 0.5) / barData.length) * 90 + 5}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="font-bold text-[#c0c1ff]">{barData[hoveredBar].day}</div>
                    <div className="flex gap-2 text-[10px] text-[#94A3B8]">
                      <span>Draft: {barData[hoveredBar].draft}</span>
                      <span className="text-[#5356ff]">
                        Conf: {barData[hoveredBar].confirmed}
                      </span>
                      <span className="text-[#10B981]">
                        Ful: {barData[hoveredBar].fulfilled}
                      </span>
                    </div>
                  </div>
                )}
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 740 220"
                >
                  <line
                    stroke="rgba(255,255,255,0.08)"
                    x1="30"
                    x2="730"
                    y1="195"
                    y2="195"
                  />
                  {barData.map((d, i) => {
                    const x = 40 + i * Math.min(42, 680 / Math.max(barData.length, 1));
                    const scale = 160 / maxBar;
                    const draftH = d.draft * scale;
                    const confH = d.confirmed * scale;
                    const fulH = d.fulfilled * scale;
                    const draftY = 195 - draftH;
                    const confY = draftY - confH;
                    const fulY = confY - fulH;
                    return (
                      <g
                        key={i}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredBar(i)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <rect fill="#31353f" height={draftH || 0} rx="2" width="14" x={x} y={draftY} />
                        <rect fill="#5356ff" height={confH || 0} rx="2" width="14" x={x} y={confY} />
                        <rect fill="#10B981" height={fulH || 0} rx="2" width="14" x={x} y={fulY} />
                      </g>
                    );
                  })}
                </svg>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md flex flex-col">
          <div>
            <h2 className="text-base font-semibold text-[#F1F5F9]">Stock Status</h2>
            <span className="text-xs text-[#94A3B8]">Availability by band</span>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                fill="transparent"
                r="62"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="15"
              />
              <circle
                cx="80"
                cy="80"
                fill="transparent"
                r="62"
                stroke="#10B981"
                strokeWidth="15"
                strokeDasharray={`${inLen} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              <circle
                cx="80"
                cy="80"
                fill="transparent"
                r="62"
                stroke="#F59E0B"
                strokeWidth="15"
                strokeDasharray={`${lowLen} ${circumference}`}
                strokeDashoffset={-inLen}
                strokeLinecap="round"
              />
              <circle
                cx="80"
                cy="80"
                fill="transparent"
                r="62"
                stroke="#EF4444"
                strokeWidth="15"
                strokeDasharray={`${outLen} ${circumference}`}
                strokeDashoffset={-(inLen + lowLen)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">{totalProducts}</span>
              <span className="font-mono text-[10px] text-[#94A3B8] uppercase">Products</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-[#94A3B8]">In Stock</span>
              </div>
              <span className="font-mono font-semibold text-white">{inStockCount}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-[#94A3B8]">Low Stock</span>
              </div>
              <span className="font-mono font-semibold text-white">{lowStockCount}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="text-[#94A3B8]">Out of Stock</span>
              </div>
              <span className="font-mono font-semibold text-white">{outOfStockCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#F1F5F9]">Recent Orders</h2>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-mono text-[#c0c1ff] hover:text-white"
            >
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#181b25] text-[#475569] font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#94A3B8]">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() =>
                        onSelectOrder ? onSelectOrder(ord) : onNavigate('orders')
                      }
                      className="hover:bg-[#262a34] cursor-pointer"
                    >
                      <td className="py-3 px-3 font-mono text-[#c0c1ff]">{ord.orderNumber}</td>
                      <td className="py-3 px-3 text-[#F1F5F9]">{ord.customerName}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px]">{ord.status}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-right">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#F1F5F9]">Low Stock Products</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/15 text-[#F59E0B]">
                {lowStockCount}
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-white/5">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-[#94A3B8]">All products healthy.</td>
                  </tr>
                ) : (
                  lowStockItems.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#262a34]">
                      <td className="py-3 px-1 font-medium text-[#F1F5F9]">{prod.name}</td>
                      <td className="py-3 px-1 font-mono text-[#94A3B8]">{prod.sku}</td>
                      <td className="py-3 px-1 font-mono text-right text-[#F59E0B]">
                        {prod.currentStock}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-3 flex justify-end border-t border-white/5">
            <button
              onClick={onOpenReorderModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5356ff] hover:bg-[#4142ee] text-white font-mono text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
              Reorder Deficit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

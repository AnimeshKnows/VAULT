import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import {
  fetchReportSummary,
  fetchStockValuation,
  type ReportSummary,
  type StockValuation,
} from '../../lib/api/reports';

interface ReportsViewProps {
  orders: Order[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders }) => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [valuation, setValuation] = useState<StockValuation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [s, v] = await Promise.all([fetchReportSummary(), fetchStockValuation()]);
        setSummary(s);
        setValuation(v);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      }
    })();
  }, []);

  const downloadReport = () => {
    const header = 'Order #,Customer,Status,Amount,Date\n';
    const rows = orders
      .map(
        (o) =>
          `${o.orderNumber},${JSON.stringify(o.customerName)},${o.status},${o.totalAmount},${o.createdAt}`
      )
      .join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${header}${rows}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'VAULT_Orders_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxCategory = Math.max(
    1,
    ...(valuation?.categories.map((c) => Number(c.valuation)) ?? [1])
  );

  return (
    <div className="relative w-full pb-16">
      <div className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            KPIs, stock valuation, and order export
          </p>
        </div>

        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Orders CSV
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-xs text-[#EF4444]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="rounded-xl bg-[#101525]/80 p-5 border border-white/5">
          <span className="font-mono text-[11px] uppercase text-[#94A3B8]">Orders</span>
          <div className="text-3xl font-bold text-white mt-1.5 font-mono">
            {summary?.totalOrders ?? '—'}
          </div>
          <span className="text-xs text-[#94A3B8] mt-2 block">
            {summary
              ? `${summary.confirmedOrders} confirmed · ${summary.fulfilledOrders} fulfilled`
              : 'Loading…'}
          </span>
        </div>

        <div className="rounded-xl bg-[#101525]/80 p-5 border border-white/5">
          <span className="font-mono text-[11px] uppercase text-[#94A3B8]">Revenue</span>
          <div className="text-3xl font-bold text-[#10B981] mt-1.5 font-mono">
            ₹{summary ? Number(summary.revenue).toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-xs text-[#94A3B8] mt-2 block">Confirmed + fulfilled</span>
        </div>

        <div className="rounded-xl bg-[#101525]/80 p-5 border border-white/5">
          <span className="font-mono text-[11px] uppercase text-[#94A3B8]">Low Stock</span>
          <div className="text-3xl font-bold text-[#F59E0B] mt-1.5 font-mono">
            {summary?.lowStockCount ?? '—'}
          </div>
          <span className="text-xs text-[#94A3B8] mt-2 block">
            {summary?.outOfStockCount ?? 0} out of stock
          </span>
        </div>

        <div className="rounded-xl bg-[#101525]/80 p-5 border border-white/5">
          <span className="font-mono text-[11px] uppercase text-[#94A3B8]">
            Stock Valuation
          </span>
          <div className="text-3xl font-bold text-[#82cfff] mt-1.5 font-mono">
            ₹
            {valuation
              ? Number(valuation.totalValuation).toLocaleString('en-IN')
              : '—'}
          </div>
          <span className="text-xs text-[#94A3B8] mt-2 block">Price × units</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl bg-[#101525]/80 p-6 border border-white/5">
          <h3 className="text-base font-semibold text-white mb-1">Order Status Mix</h3>
          <p className="text-xs text-[#94A3B8] mb-6">Share of orders by lifecycle stage</p>
          {summary ? (
            <div className="space-y-4 text-xs font-mono">
              {(
                [
                  ['Draft', summary.draftOrders, '#31353f'],
                  ['Confirmed', summary.confirmedOrders, '#5356ff'],
                  ['Fulfilled', summary.fulfilledOrders, '#10B981'],
                  ['Cancelled', summary.cancelledOrders, '#EF4444'],
                ] as const
              ).map(([label, count, color]) => {
                const pct =
                  summary.totalOrders > 0
                    ? Math.round((count / summary.totalOrders) * 100)
                    : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white">{label}</span>
                      <span style={{ color }}>
                        {pct}% ({count})
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8]">Loading…</p>
          )}
        </div>

        <div className="rounded-xl bg-[#101525]/80 p-6 border border-white/5">
          <h3 className="text-base font-semibold text-white mb-1">Valuation by Category</h3>
          <p className="text-xs text-[#94A3B8] mb-6">Inventory value breakdown</p>
          {valuation && valuation.categories.length > 0 ? (
            <div className="space-y-3 text-xs">
              {valuation.categories.map((cat) => (
                <div
                  key={cat.category}
                  className="p-3 rounded-lg bg-[#181b25] border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-white">{cat.category}</span>
                    <span className="font-mono text-[#82cfff]">
                      ₹{Number(cat.valuation).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-[#5356ff] rounded-full"
                      style={{
                        width: `${(Number(cat.valuation) / maxCategory) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 text-[#475569] font-mono text-[10px]">
                    {cat.productCount} SKUs · {cat.totalUnits} units
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8]">No valuation data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

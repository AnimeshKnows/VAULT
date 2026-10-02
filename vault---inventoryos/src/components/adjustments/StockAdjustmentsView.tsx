import React, { useState } from 'react';
import { StockAdjustment } from '../../types';

interface StockAdjustmentsViewProps {
  adjustments: StockAdjustment[];
  onOpenNewAdjustment: () => void;
}

export const StockAdjustmentsView: React.FC<StockAdjustmentsViewProps> = ({
  adjustments,
  onOpenNewAdjustment,
}) => {
  const [filterType, setFilterType] = useState('All');

  const filteredAdjustments = adjustments.filter((adj) => {
    if (filterType !== 'All' && adj.type !== filterType) return false;
    return true;
  });

  return (
    <div className="relative w-full pb-16">
      {/* Top ambient glow */}
      <div className="absolute -top-10 left-1/3 w-96 h-48 bg-[#7e4ee8]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
            <span>OPERATIONS</span>
            <span>/</span>
            <span className="text-[#c0c1ff]">AUDIT LEDGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Stock Adjustments & Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Immutable SHA-256 warehouse mutations, physical cycle audits & inbound receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c2029] border border-white/5 text-[11px] font-mono text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#10B981] font-semibold">100% CONSENSUS INTEGRITY</span>
          </div>

          <button
            onClick={onOpenNewAdjustment}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold shadow-[0_0_20px_rgba(83,86,255,0.45)] hover:shadow-[0_0_28px_rgba(83,86,255,0.65)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>New Adjustment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto p-1 rounded-xl bg-[#181b25] border border-white/5 w-fit">
        {['All', 'Physical Audit', 'Damage Write-off', 'Inbound Receipt'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filterType === t
                ? 'bg-[#262a34] text-white shadow-sm font-semibold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl border border-white/5 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#181b25] text-[#475569] font-mono text-[10px] uppercase tracking-wider border-b border-white/5">
                <th className="py-3 px-4">Adjustment ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Delta / Transition</th>
                <th className="py-3 px-4">Reason & Bin</th>
                <th className="py-3 px-4">Operator Badge</th>
                <th className="py-3 px-4 text-right">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-[#181b25]/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-[#c0c1ff]">
                    {adj.adjustmentNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#94A3B8]">
                    {adj.timestamp}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{adj.productName}</span>
                      <span className="font-mono text-[10px] text-[#475569]">SKU: {adj.sku}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        adj.type === 'Physical Audit'
                          ? 'bg-[#5356ff]/15 text-[#c0c1ff]'
                          : adj.type === 'Inbound Receipt' || adj.type === 'Reorder Arrival'
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : 'bg-[#EF4444]/15 text-[#EF4444]'
                      }`}
                    >
                      {adj.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-mono">
                      <span
                        className={`font-bold ${
                          adj.delta > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                        }`}
                      >
                        {adj.delta > 0 ? `+${adj.delta}` : adj.delta}
                      </span>
                      <span className="text-[#475569]">
                        ({adj.previousStock} → {adj.newStock})
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-col">
                      <span className="text-white text-[11px] truncate">{adj.reason}</span>
                      <span className="text-[10px] font-mono text-[#82cfff]">{adj.binLocation}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#dfe2ef]">
                    {adj.operatorBadge}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#94A3B8] text-right text-[11px]">
                    {adj.hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

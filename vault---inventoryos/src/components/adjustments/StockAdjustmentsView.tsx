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
      <div className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Stock Adjustments
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Audit history of stock mutations for this workspace
          </p>
        </div>

        <button
          onClick={onOpenNewAdjustment}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          New Adjustment
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto p-1 rounded-xl bg-[#181b25] border border-white/5 w-fit">
        {['All', 'Inbound Receipt', 'Damage Write-off'].map((t) => (
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

      <div className="rounded-xl bg-[#101525]/80 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#181b25] text-[#475569] font-mono text-[10px] uppercase border-b border-white/5">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Delta</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#94A3B8]">
                    No stock adjustments recorded yet.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-[#181b25]/80">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#c0c1ff]">
                      {adj.adjustmentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#94A3B8]">{adj.timestamp}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{adj.productName}</span>
                        <span className="font-mono text-[10px] text-[#475569]">
                          SKU: {adj.sku}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          adj.delta >= 0
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
                    <td className="py-3.5 px-4 max-w-xs text-white text-[11px] truncate">
                      {adj.reason}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#dfe2ef]">
                      {adj.operatorBadge}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

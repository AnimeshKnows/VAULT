import React, { useState } from 'react';
import { Product } from '../../types';

interface StockAdjustModalProps {
  product: Product;
  onClose: () => void;
  onApplyAdjustment: (productId: string, delta: number, reason: string) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  product,
  onClose,
  onApplyAdjustment,
}) => {
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState('Routine physical cycle count verification');

  const newStock = Math.max(0, product.currentStock + delta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (delta === 0) return;
    onApplyAdjustment(product.id, delta, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0f131c] border border-white/10 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#82cfff] text-[20px]">tune</span>
            <h3 className="text-base font-semibold text-white">Adjust Stock: {product.name}</h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#181b25] border border-white/5">
            <img
              src={product.image}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover bg-[#0E1424]"
            />
            <div>
              <span className="font-semibold text-white block">{product.name}</span>
              <span className="font-mono text-[#82cfff] text-[10px]">SKU: {product.sku}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-[#181b25]/60 border border-white/5">
            <div>
              <span className="text-[10px] text-[#94A3B8] block">Current</span>
              <span className="text-base font-bold font-mono text-white">{product.currentStock}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#94A3B8] block">Adjustment</span>
              <span
                className={`text-base font-bold font-mono ${
                  delta > 0 ? 'text-[#10B981]' : delta < 0 ? 'text-[#EF4444]' : 'text-white'
                }`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#94A3B8] block">Resulting</span>
              <span className="text-base font-bold font-mono text-[#c0c1ff]">{newStock}</span>
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1">Delta (+ for Inbound, - for Damage/Shrinkage)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDelta((prev) => prev - 5)}
                className="px-2.5 py-1 rounded bg-[#262a34] text-white hover:bg-[#31353f] font-mono"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => setDelta((prev) => prev - 1)}
                className="px-2.5 py-1 rounded bg-[#262a34] text-white hover:bg-[#31353f] font-mono"
              >
                -1
              </button>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
                className="flex-1 h-9 text-center font-mono rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
              <button
                type="button"
                onClick={() => setDelta((prev) => prev + 1)}
                className="px-2.5 py-1 rounded bg-[#262a34] text-white hover:bg-[#31353f] font-mono"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setDelta((prev) => prev + 5)}
                className="px-2.5 py-1 rounded bg-[#262a34] text-white hover:bg-[#31353f] font-mono"
              >
                +5
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1">Audit Ledger Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
            />
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={delta === 0}
              className="px-5 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white font-medium shadow-[0_0_16px_rgba(83,86,255,0.4)] disabled:opacity-40"
            >
              Commit Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

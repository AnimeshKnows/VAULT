import React, { useState } from 'react';
import { Product } from '../../types';

interface ReorderDeficitModalProps {
  products: Product[];
  onClose: () => void;
  onExecuteReorder: (replenishments: { productId: string; addUnits: number }[]) => void;
}

export const ReorderDeficitModal: React.FC<ReorderDeficitModalProps> = ({
  products,
  onClose,
  onExecuteReorder,
}) => {
  const lowStock = products.filter((p) => p.status === 'Low Stock' || p.currentStock <= p.threshold);

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    lowStock.forEach((p) => {
      // Deficit to bring to threshold + safety buffer of 10
      const deficit = Math.max(5, p.threshold - p.currentStock + 10);
      initial[p.id] = deficit;
    });
    return initial;
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleQtyChange = (id: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, val),
    }));
  };

  const totalCost = lowStock.reduce((acc, p) => {
    const qty = quantities[p.id] || 0;
    return acc + qty * p.unitPrice;
  }, 0);

  const handleExecute = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const itemsToReplenish = lowStock.map((p) => ({
        productId: p.id,
        addUnits: quantities[p.id] || 10,
      }));
      onExecuteReorder(itemsToReplenish);
      setIsProcessing(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#0f131c] border border-white/10 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Automated Deficit Replenishment
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Restock critical items below safe operating thresholds
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {lowStock.map((prod) => {
            const qty = quantities[prod.id] || 10;
            return (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#181b25] border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-10 h-10 rounded-lg object-cover bg-[#0E1424]"
                  />
                  <div>
                    <h4 className="font-medium text-white">{prod.name}</h4>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-[#94A3B8] mt-0.5">
                      <span className="text-[#82cfff]">SKU: {prod.sku}</span>
                      <span>•</span>
                      <span className="text-[#EF4444] font-bold">Current: {prod.currentStock}</span>
                      <span>•</span>
                      <span>Min: {prod.threshold}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#94A3B8]">Restock Units</span>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => handleQtyChange(prod.id, parseInt(e.target.value) || 1)}
                      className="w-16 h-7 px-2 text-center rounded bg-[#0a0e17] border border-white/10 text-white font-mono text-xs focus:ring-1 focus:ring-[#5356ff]"
                    />
                  </div>
                  <div className="text-right min-w-20 font-mono">
                    <span className="text-[10px] text-[#94A3B8] block">Est. Cost</span>
                    <span className="font-bold text-white">
                      ₹{(qty * prod.unitPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PO Footer */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#94A3B8] block">Consolidated Purchase Order</span>
            <span className="text-lg font-bold font-mono text-[#82cfff]">
              ₹{totalCost.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold shadow-[0_0_16px_rgba(83,86,255,0.4)] disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Dispatching PO...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Commit Purchase Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

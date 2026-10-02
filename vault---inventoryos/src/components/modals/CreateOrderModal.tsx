import React, { useState } from 'react';
import { Product, OrderItem, OrderStatus } from '../../types';

interface CreateOrderModalProps {
  products: Product[];
  onClose: () => void;
  onCreateOrder: (order: {
    customerName: string;
    customerEmail: string;
    items: { productId: string; quantity: number }[];
    confirmImmediately?: boolean;
  }) => void | Promise<void>;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  products,
  onClose,
  onCreateOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [status, setStatus] = useState<OrderStatus>('Draft');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add item to draft order
  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingIdx = items.findIndex((i) => i.productId === prod.id);
    if (existingIdx > -1) {
      const updated = [...items];
      updated[existingIdx].quantity += quantity;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          sku: prod.sku,
          name: prod.name,
          quantity,
          unitPrice: prod.unitPrice,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const totalAmount = items.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await onCreateOrder({
        customerName,
        customerEmail:
          customerEmail ||
          `${customerName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        confirmImmediately: status === 'Confirmed' || status === 'Fulfilled',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#0f131c] border border-white/10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5356ff] text-[22px]">receipt_long</span>
            <h3 className="text-base font-semibold text-white">Create New Order</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] font-mono">
              {error}
            </div>
          )}
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#94A3B8] mb-1 font-medium">Customer Full Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Maya Deshmukh"
                required
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1 font-medium">Corporate Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. maya@enterprise.in"
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1 font-medium">Delivery Address</label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="e.g. Block B, Tech Hub, Mumbai"
              className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
            />
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1 font-medium">Initial Dispatch Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
            >
              <option value="Draft">Draft (create only — no stock decrement)</option>
              <option value="Confirmed">Confirmed (create then confirm — decrements stock)</option>
            </select>
          </div>

          {/* Add Line Items Section */}
          <div className="pt-2 border-t border-white/5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#c0c1ff] block mb-2 font-semibold">
              Select SKUs for Inbound Order
            </span>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-[#94A3B8] mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - ₹{p.unitPrice.toLocaleString('en-IN')} (Stock: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-[#94A3B8] mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white text-center font-mono focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="h-9 px-3.5 rounded-lg bg-[#262a34] hover:bg-[#31353f] text-[#82cfff] border border-white/10 font-medium"
              >
                + Add SKU
              </button>
            </div>
          </div>

          {/* Added Line Items List */}
          <div className="space-y-2 mt-2">
            {items.length === 0 ? (
              <div className="py-4 text-center text-[#475569] text-xs">
                No items added yet. Pick a SKU and click &quot;+ Add SKU&quot;.
              </div>
            ) : (
              items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#181b25] border border-white/5"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{it.name}</span>
                    <span className="font-mono text-[10px] text-[#82cfff]">
                      {it.sku} • {it.quantity} unit(s) @ ₹{it.unitPrice}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">
                      ₹{(it.quantity * it.unitPrice).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-[#94A3B8] hover:text-[#EF4444]"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total & Submit */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#94A3B8] block">Order Grand Total</span>
              <span className="text-xl font-bold font-mono text-[#82cfff]">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={items.length === 0 || !customerName || submitting}
                className="px-5 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white font-medium shadow-[0_0_16px_rgba(83,86,255,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Committing…' : 'Commit Order to Ledger'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

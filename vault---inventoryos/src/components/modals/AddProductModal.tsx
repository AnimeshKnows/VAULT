import React, { useState } from 'react';

interface AddProductModalProps {
  onClose: () => void;
  onAddProduct: (prod: {
    name: string;
    sku: string;
    category: string;
    unitPrice: number;
    initialStock: number;
    threshold: number;
  }) => void | Promise<void>;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAddProduct }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState(`SKU-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState('Peripherals');
  const [unitPrice, setUnitPrice] = useState(1200);
  const [initialStock, setInitialStock] = useState(25);
  const [threshold, setThreshold] = useState(10);
  const [warehouseBin, setWarehouseBin] = useState('Zone Alpha // Bay 03-A');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    await onAddProduct({
      name,
      sku: sku.toUpperCase(),
      category,
      unitPrice,
      initialStock,
      threshold,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0f131c] border border-white/10 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5356ff] text-[20px]">add_box</span>
            <h3 className="text-base font-semibold text-white">Add New Product SKU</h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#94A3B8] mb-1">Product Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ergonomic Standing Pad"
                required
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">SKU Code *</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#94A3B8] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              >
                <option value="Peripherals">Peripherals</option>
                <option value="Accessories">Accessories</option>
                <option value="Displays">Displays</option>
                <option value="Hardware">Hardware</option>
                <option value="Audio">Audio</option>
                <option value="Video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Unit Price (₹ INR)</label>
              <input
                type="number"
                min={1}
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#94A3B8] mb-1">Initial Stock</label>
              <input
                type="number"
                min={0}
                value={initialStock}
                onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Low Threshold</label>
              <input
                type="number"
                min={1}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Bin Location</label>
              <input
                type="text"
                value={warehouseBin}
                onChange={(e) => setWarehouseBin(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white text-[11px] focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
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
              className="px-5 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white font-medium shadow-[0_0_16px_rgba(83,86,255,0.4)]"
            >
              Add to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

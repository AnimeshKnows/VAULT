import React, { useState } from 'react';
import { Product } from '../../types';

interface ProductsViewProps {
  products: Product[];
  onOpenAddProduct: () => void;
  onOpenStockAdjust: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onOpenAddProduct,
  onOpenStockAdjust,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const categories = ['All', 'Peripherals', 'Accessories', 'Displays', 'Hardware', 'Audio', 'Video'];

  const filteredProducts = products.filter((prod) => {
    if (selectedCategory !== 'All' && prod.category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && prod.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return prod.name.toLowerCase().includes(q) || prod.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="relative w-full pb-16">
      {/* Top ambient glow */}
      <div className="absolute -top-10 left-1/4 w-96 h-48 bg-[#5356ff]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
            <span>OPERATIONS</span>
            <span>/</span>
            <span className="text-[#82cfff]">SKU TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Products & SKUs
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Real-time multi-warehouse catalog, bin allocations & stock thresholds
          </p>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold shadow-[0_0_20px_rgba(83,86,255,0.45)] hover:shadow-[0_0_28px_rgba(83,86,255,0.65)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Product</span>
        </button>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[#181b25] border border-white/5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#262a34] text-white shadow-sm font-semibold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#94A3B8] text-[16px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU or title..."
              className="h-9 pl-9 pr-3 rounded-xl bg-[#181b25] border border-white/5 text-xs text-white placeholder:text-[#475569] focus:outline-none focus:ring-1 focus:ring-[#5356ff] w-52 sm:w-64"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#181b25] border border-white/5 text-xs text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl border border-white/5 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#181b25] text-[#475569] font-mono text-[10px] uppercase tracking-wider border-b border-white/5">
                <th className="py-3 px-4">Item & Title</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Warehouse Bin</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((prod) => {
                const stockPercent = Math.min(100, Math.round((prod.currentStock / (prod.threshold * 2)) * 100));
                return (
                  <tr key={prod.id} className="hover:bg-[#181b25]/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg bg-[#0E1424] object-cover ring-1 ring-white/10"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-white group-hover:text-[#c0c1ff] transition-colors">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-[#475569] font-mono">
                            Last audit: {prod.lastAuditDate || 'Recent'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#82cfff] font-medium">
                      {prod.sku}
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      {prod.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white text-[11px]">
                      {prod.warehouseBin || 'Zone Alpha / Bay 14-C'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1 min-w-24">
                        <div className="flex items-center gap-1 font-mono text-xs">
                          <span
                            className={`font-bold ${
                              prod.currentStock === 0
                                ? 'text-[#EF4444]'
                                : prod.currentStock <= prod.threshold
                                ? 'text-[#F59E0B]'
                                : 'text-[#10B981]'
                            }`}
                          >
                            {prod.currentStock}
                          </span>
                          <span className="text-[#475569]">/ {prod.threshold} min</span>
                        </div>
                        {/* Stock percentage bar */}
                        <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              prod.currentStock === 0
                                ? 'bg-[#EF4444]'
                                : prod.currentStock <= prod.threshold
                                ? 'bg-[#F59E0B]'
                                : 'bg-[#10B981]'
                            }`}
                            style={{ width: `${Math.max(5, stockPercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white text-right">
                      ₹{prod.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                          prod.status === 'In Stock'
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : prod.status === 'Low Stock'
                            ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                            : 'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}
                      >
                        {prod.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenStockAdjust(prod)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#5356ff]/20 text-[#c0c1ff] hover:text-white border border-white/5 text-[11px] font-mono transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';

interface OrdersViewProps {
  orders: Order[];
  onOpenCreateOrder: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  canCancelOrders?: boolean;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenCreateOrder,
  onUpdateOrderStatus,
  canCancelOrders = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Tab counts
  const draftCount = orders.filter((o) => o.status === 'Draft').length;
  const confirmedCount = orders.filter((o) => o.status === 'Confirmed').length;
  const fulfilledCount = orders.filter((o) => o.status === 'Fulfilled').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'Draft' && order.status !== 'Draft') return false;
    if (activeTab === 'Confirmed' && order.status !== 'Confirmed') return false;
    if (activeTab === 'Fulfilled' && order.status !== 'Fulfilled') return false;
    if (activeTab === 'Cancelled' && order.status !== 'Cancelled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const displayedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Get initials for customer avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative w-full pb-16">
      {/* Dynamic top ambient glow */}
      <div className="absolute -top-10 right-1/4 w-96 h-48 bg-[#5356ff]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Breadcrumb & Header */}
      <div className="pt-4 pb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
          <span>OPERATIONS</span>
          <span>/</span>
          <span className="text-[#82cfff]">LEDGER PIPELINE</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
              Orders
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Manage customer orders and dispatch pipelines
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] font-mono text-[#94A3B8]">
              {orders.length} orders
            </span>

            <button
              onClick={onOpenCreateOrder}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold shadow-[0_0_20px_rgba(83,86,255,0.45)] hover:shadow-[0_0_28px_rgba(83,86,255,0.65)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Card 1 */}
        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
              All Inbound
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#5356ff]/15 flex items-center justify-center text-[#c0c1ff]">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mt-1 font-sans">{orders.length}</div>
          <div className="text-xs font-mono text-[#10B981] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            <span>+14.2% today</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
              Confirmed Active
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mt-1 font-sans">{confirmedCount}</div>
          <div className="text-xs text-[#94A3B8] mt-2">Ready for packing</div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
              Draft Allocations
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#7e4ee8]/15 flex items-center justify-center text-[#d0bcff]">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mt-1 font-sans">{draftCount}</div>
          <div className="text-xs text-[#F59E0B] mt-2 flex items-center gap-1 font-mono">
            <span className="material-symbols-outlined text-[14px]">pending</span>
            <span>Pending approval</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5 shadow-md">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
              Ledger Gross
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#00a3e0]/15 flex items-center justify-center text-[#82cfff]">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mt-1 font-mono">₹11,630</div>
          <div className="text-xs font-mono text-[#10B981] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>Batch volume</span>
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#181b25] border border-white/5 overflow-x-auto">
          {[
            { label: 'All Orders', count: orders.length },
            { label: 'Draft', count: draftCount },
            { label: 'Confirmed', count: confirmedCount },
            { label: 'Fulfilled', count: fulfilledCount },
            { label: 'Cancelled', count: cancelledCount },
          ].map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#262a34] text-white shadow-sm font-semibold'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                    isActive ? 'bg-[#5356ff] text-white' : 'bg-white/5 text-[#94A3B8]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#94A3B8] text-[16px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="h-9 pl-9 pr-3 rounded-xl bg-[#181b25] border border-white/5 text-xs text-white placeholder:text-[#475569] focus:outline-none focus:ring-1 focus:ring-[#5356ff] w-48 sm:w-60"
            />
          </div>

          <button className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#181b25] border border-white/5 text-[#94A3B8] hover:text-white text-xs font-mono">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span className="hidden sm:inline">Sep 1, 2026 - Sep 22, 2026</span>
          </button>

          <button className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#181b25] border border-white/5 text-[#94A3B8] hover:text-white">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl border border-white/5 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#181b25] text-[#475569] font-mono text-[10px] uppercase tracking-wider border-b border-white/5">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                displayedOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-[#181b25]/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrderDetails(ord)}
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-[#c0c1ff] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">
                        description
                      </span>
                      <span>{ord.orderNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#262a34] text-[#c0c1ff] font-mono text-[11px] font-bold flex items-center justify-center ring-1 ring-white/10">
                          {getInitials(ord.customerName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{ord.customerName}</span>
                          <span className="text-[10px] text-[#475569]">{ord.customerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                          ord.status === 'Confirmed'
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : ord.status === 'Draft'
                            ? 'bg-[#31353f] text-[#c6c4d9]'
                            : ord.status === 'Fulfilled'
                            ? 'bg-[#06B6D4]/15 text-[#06B6D4]'
                            : 'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 currentColor" style={{
                          backgroundColor:
                            ord.status === 'Confirmed' ? '#10B981' :
                            ord.status === 'Draft' ? '#94A3B8' :
                            ord.status === 'Fulfilled' ? '#06B6D4' : '#EF4444'
                        }} />
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white text-right">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#94A3B8]">
                      {ord.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          setActionMenuOpenId(actionMenuOpenId === ord.id ? null : ord.id)
                        }
                        className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5"
                        title="Order options"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>

                      {/* Action Dropdown Menu */}
                      {actionMenuOpenId === ord.id && (
                        <div className="absolute right-4 top-8 w-44 rounded-xl bg-[#0f131c] border border-white/10 shadow-2xl p-1.5 z-40 text-left animate-in fade-in duration-100">
                          <button
                            onClick={() => {
                              setSelectedOrderDetails(ord);
                              setActionMenuOpenId(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                            <span>View Details</span>
                          </button>
                          {ord.status !== 'Confirmed' && (
                            <button
                              onClick={() => {
                                onUpdateOrderStatus(ord.id, 'Confirmed');
                                setActionMenuOpenId(null);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[#10B981] hover:bg-[#10B981]/10 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[15px]">check</span>
                              <span>Mark Confirmed</span>
                            </button>
                          )}
                          {ord.status !== 'Fulfilled' && (
                            <button
                              onClick={() => {
                                onUpdateOrderStatus(ord.id, 'Fulfilled');
                                setActionMenuOpenId(null);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[#06B6D4] hover:bg-[#06B6D4]/10 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                              <span>Mark Fulfilled</span>
                            </button>
                          )}
                          {canCancelOrders && ord.status !== 'Cancelled' && (
                            <button
                              onClick={() => {
                                onUpdateOrderStatus(ord.id, 'Cancelled');
                                setActionMenuOpenId(null);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[15px]">cancel</span>
                              <span>Cancel Order</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <span>
            Showing <strong className="text-white">{displayedOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-white">
              {Math.min(currentPage * pageSize, filteredOrders.length)}
            </strong>{' '}
            of <strong className="text-white">{filteredOrders.length}</strong> orders
          </span>

          <div className="flex items-center gap-1.5 font-mono">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === i + 1
                    ? 'bg-[#5356ff] text-white shadow-[0_0_12px_rgba(83,86,255,0.4)]'
                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f131c] border border-white/10 shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-white/5 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-[#c0c1ff]">
                    {selectedOrderDetails.orderNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                      selectedOrderDetails.status === 'Confirmed'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : selectedOrderDetails.status === 'Draft'
                        ? 'bg-[#31353f] text-[#c6c4d9]'
                        : selectedOrderDetails.status === 'Fulfilled'
                        ? 'bg-[#06B6D4]/15 text-[#06B6D4]'
                        : 'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}
                  >
                    {selectedOrderDetails.status}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 font-mono">
                  Created: {selectedOrderDetails.createdAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#181b25] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Customer</span>
                  <span className="font-medium text-white">{selectedOrderDetails.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Email</span>
                  <span className="font-mono text-[#94A3B8]">{selectedOrderDetails.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Created</span>
                  <span className="font-mono text-white">{selectedOrderDetails.createdAt}</span>
                </div>
                {selectedOrderDetails.shippingAddress && (
                  <div className="flex justify-between pt-1 border-t border-white/5">
                    <span className="text-[#94A3B8]">Shipping</span>
                    <span className="text-right text-[#dfe2ef] max-w-xs">{selectedOrderDetails.shippingAddress}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div>
                <span className="font-mono text-[10px] text-[#94A3B8] uppercase block mb-2">
                  Line Items ({selectedOrderDetails.items.length})
                </span>
                <div className="space-y-2">
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#181b25] border border-white/5"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{item.name}</span>
                        <span className="font-mono text-[10px] text-[#475569]">SKU: {item.sku}</span>
                      </div>
                      <div className="text-right font-mono">
                        <div>
                          {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[#c0c1ff] font-bold">
                          ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/5 text-sm font-semibold">
                <span className="text-white">Order Total</span>
                <span className="font-mono text-[#82cfff] text-base">
                  ₹{selectedOrderDetails.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

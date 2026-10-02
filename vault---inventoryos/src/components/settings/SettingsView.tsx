import React, { useState } from 'react';
import { Tenant } from '../../types';

interface SettingsViewProps {
  currentTenant: Tenant;
  onUpdateTenantName: (newName: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTenant,
  onUpdateTenantName,
}) => {
  const [storeName, setStoreName] = useState(currentTenant.name);
  const [autoReorderEnabled, setAutoReorderEnabled] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTenantName(storeName);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="relative w-full pb-16 max-w-4xl">
      {/* Header */}
      <div className="pt-4 pb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
          <span>SYSTEM</span>
          <span>/</span>
          <span className="text-[#82cfff]">PREFERENCES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
          Tenant Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Configure multi-tenant ledger rules, currency formats, and automated inventory pipelines
        </p>
      </div>

      {savedAlert && (
        <div className="mb-6 p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-mono flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Configuration saved and propagated to consensus ledger nodes.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Workspace Identity */}
        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-6 border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Workspace & Ledger Identity</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#94A3B8] mb-1">Store / Tenant Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1">Tenant Code (Immutable)</label>
              <input
                type="text"
                disabled
                value={currentTenant.code}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25]/50 border border-white/5 text-[#94A3B8] font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1">Assigned Ledger Consensus Node</label>
            <input
              type="text"
              disabled
              value={currentTenant.ledgerNode}
              className="w-full h-9 px-3 rounded-lg bg-[#181b25]/50 border border-white/5 text-[#94A3B8] font-mono cursor-not-allowed"
            />
          </div>
        </div>

        {/* Currency & Reorder Rules */}
        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-6 border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Logistics & Reorder Triggers</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#94A3B8] mb-1">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              >
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1">Deficit Alert Threshold</label>
              <input
                type="number"
                defaultValue={10}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReorderEnabled}
                onChange={(e) => setAutoReorderEnabled(e.target.checked)}
                className="w-4 h-4 rounded bg-[#31353f] accent-[#5356ff] cursor-pointer"
              />
              <div>
                <span className="text-white font-medium block">
                  Enable Auto-Reorder Trigger
                </span>
                <span className="text-[#94A3B8] text-[11px]">
                  Automatically draft purchase orders when any SKU falls beneath safe threshold
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold shadow-[0_0_20px_rgba(83,86,255,0.45)] transition-all cursor-pointer"
          >
            Save Tenant Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

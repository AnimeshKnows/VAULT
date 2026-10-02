import React, { useEffect, useState } from 'react';
import { Tenant } from '../../types';
import { ApiError } from '../../lib/api/client';

interface SettingsViewProps {
  currentTenant: Tenant;
  onUpdateTenantName: (newName: string) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTenant,
  onUpdateTenantName,
}) => {
  const [storeName, setStoreName] = useState(currentTenant.name);
  const [savedAlert, setSavedAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStoreName(currentTenant.name);
  }, [currentTenant.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onUpdateTenantName(storeName);
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full pb-16 max-w-4xl">
      <div className="pt-4 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
          Tenant Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Update workspace identity for this tenant
        </p>
      </div>

      {savedAlert && (
        <div className="mb-6 p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-mono flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Workspace name saved.
        </div>
      )}
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs">
          {error}
        </div>
      )}

      <form onSubmit={(e) => void handleSave(e)} className="space-y-6 text-xs">
        <div className="rounded-xl bg-[#101525]/80 p-6 border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Workspace Identity</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#94A3B8] mb-1">Tenant Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1">Tenant ID</label>
              <input
                type="text"
                disabled
                value={currentTenant.id}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25]/50 border border-white/5 text-[#94A3B8] font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#94A3B8] mb-1">Status</label>
              <input
                type="text"
                disabled
                value={currentTenant.isActive ? 'Active' : 'Inactive'}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25]/50 border border-white/5 text-[#94A3B8] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">SKU Count</label>
              <input
                type="text"
                disabled
                value={String(currentTenant.skuCount)}
                className="w-full h-9 px-3 rounded-lg bg-[#181b25]/50 border border-white/5 text-[#94A3B8] font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

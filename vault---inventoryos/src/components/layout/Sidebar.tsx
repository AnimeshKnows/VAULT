import React from 'react';
import { NavigationPage } from '../../types';
import { VAULT_LOGO_URL } from '../../data/mockData';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  ledgerNumber?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  ledgerNumber = 819,
}) => {
  const operationsNav = [
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: 'grid_view' },
    { id: 'products' as NavigationPage, label: 'Products', icon: 'inventory_2' },
    { id: 'orders' as NavigationPage, label: 'Orders', icon: 'receipt_long' },
    { id: 'stock-adjustments' as NavigationPage, label: 'Stock Adjustments', icon: 'tune' },
    { id: 'users' as NavigationPage, label: 'Users', icon: 'group' },
    { id: 'reports' as NavigationPage, label: 'Reports', icon: 'analytics' },
  ];

  const systemNav = [
    { id: 'settings' as NavigationPage, label: 'Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#0a0e17]/90 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col justify-between transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Platform Name */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/5">
            <button 
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 text-left group transition-opacity hover:opacity-90"
              title="Return to Public Overview"
            >
              <img
                src={VAULT_LOGO_URL}
                alt="VAULT Logo"
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-[17px] font-semibold text-[#F1F5F9] tracking-tight leading-tight">
                  VAULT
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#c0c1ff] font-semibold">
                  INVENTORYOS
                </span>
              </div>
            </button>
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile} 
                className="lg:hidden text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Operations Nav Section */}
          <div className="px-3 py-4">
            <div className="text-[#475569] font-mono text-[11px] font-semibold uppercase tracking-wider px-3 pb-2">
              Operations
            </div>
            <nav className="space-y-1">
              {operationsNav.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#262a34] text-[#c0c1ff] shadow-[0_0_16px_rgba(83,86,255,0.22)] font-semibold border-l-2 border-[#5356ff]'
                        : 'text-[#94A3B8] hover:bg-[#181b25] hover:text-[#dfe2ef]'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#5356ff]' : 'text-[#94A3B8]'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* System & Ledger Status Footer */}
        <div className="p-3 border-t border-white/5">
          <div className="text-[#475569] font-mono text-[11px] font-semibold uppercase tracking-wider px-3 pb-2">
            System
          </div>
          <nav className="space-y-1 mb-3">
            {systemNav.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#262a34] text-[#c0c1ff]'
                      : 'text-[#94A3B8] hover:bg-[#181b25] hover:text-[#dfe2ef]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <button
              onClick={() => onNavigate('landing')}
              className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-[#181b25] hover:text-[#EF4444] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Logout / Exit</span>
            </button>
          </nav>

          {/* Immutable Ledger Sync Capsule */}
          <div className="bg-[#1c2029] border border-white/5 px-3 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#94A3B8] tracking-wider">
                SYNCED : LEDGER #{ledgerNumber}
              </span>
            </div>
            <span className="material-symbols-outlined text-[#475569] text-[16px]">bolt</span>
          </div>
        </div>
      </aside>
    </>
  );
};

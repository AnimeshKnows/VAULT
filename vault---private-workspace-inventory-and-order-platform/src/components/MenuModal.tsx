import React, { useEffect } from 'react';
import { X, ArrowUpRight, Shield, Layers, Lock, Cpu } from 'lucide-react';
import { VaultPillButton } from './VaultPillButton';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDemo?: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  onOpenDemo,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navItems = [
    { num: 'S.02', label: 'Capabilities', href: '#capabilities' },
    { num: 'S.03', label: 'Modules Dial', href: '#modules' },
    { num: 'S.04', label: 'Security & Privacy', href: '#security' },
    { num: 'S.05', label: 'How It Works', href: '#how-it-works' },
    { num: 'S.06', label: 'Product Promises', href: '#principles' },
    { num: 'S.07', label: 'Teams', href: '#stack' },
    { num: 'S.08', label: 'Get Started', href: '#signup' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#141414] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation Menu"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#FFB020]" />
          </div>
          <div>
            <div className="font-mono text-sm font-bold tracking-widest uppercase">
              VAULT
            </div>
            <div className="font-mono text-[10px] text-neutral-400">
              PRIVATE WORKSPACE INVENTORY &amp; ORDERS
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <span>CLOSE</span>
          <div className="w-6 h-6 rounded-full bg-white text-[#141414] flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Main navigation list */}
      <div className="my-10 max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <div className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest mb-4">
            DIRECTORY
          </div>
          <ul className="space-y-3 font-mono">
            {navItems.map((item) => (
              <li key={item.num}>
                <a
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-baseline justify-between py-2 text-lg sm:text-2xl font-bold tracking-tight text-neutral-300 hover:text-white transition-colors border-b border-neutral-800/60"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[#FFB020] font-normal">
                      [{item.num}]
                    </span>
                    <span className="font-sans font-extrabold uppercase">
                      {item.label}
                    </span>
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-neutral-600 group-hover:text-[#FFB020] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Overview & action */}
        <div className="space-y-6 md:pl-8 md:border-l md:border-neutral-800">
          <div>
            <div className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest mb-2">
              PLATFORM OVERVIEW
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              VAULT gives every business its own private workspace to manage products, catalog SKUs, stock levels, and order fulfillment.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span>WORKSPACE MODEL:</span>
              <span className="text-[#FFB020]">PRIVATE &amp; ISOLATED</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>DATA VISIBILITY:</span>
              <span className="text-white">YOUR TEAM ONLY</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>ACCESS ROLES:</span>
              <span className="text-white">ADMIN &amp; STAFF</span>
            </div>
          </div>

          <div>
            <VaultPillButton
              label="CREATE YOUR WORKSPACE"
              variant="light"
              href="/signup"
              onClick={onClose}
            />
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-neutral-500">
        <div>2026 VAULT · PRIVATE WORKSPACE INVENTORY &amp; ORDERS</div>
        <div className="flex gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300 transition-colors"
          >
            GITHUB
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300 transition-colors"
          >
            LINKEDIN
          </a>
          <a
            href="mailto:hello@vault-ledger.internal"
            className="hover:text-neutral-300 transition-colors"
          >
            HELLO@VAULT-LEDGER.INTERNAL
          </a>
        </div>
      </div>
    </div>
  );
};

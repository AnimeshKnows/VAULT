import React from 'react';
import { Shield, Layers, Package, ShoppingCart, Users, FileText, CheckCircle2, Lock } from 'lucide-react';

interface MockupFrameProps {
  title?: string;
  badge?: string;
  accent?: 'amber' | 'cyan' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const MockupWindow: React.FC<MockupFrameProps> = ({
  title = 'VAULT Workspace',
  badge = 'PRIVATE WORKSPACE',
  accent = 'amber',
  children,
  className = '',
}) => {
  const glowStyle =
    accent === 'amber'
      ? 'border-neutral-800 shadow-[0_0_30px_-5px_rgba(255,176,32,0.15)]'
      : accent === 'cyan'
      ? 'border-neutral-800 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]'
      : 'border-neutral-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]';

  return (
    <div
      className={`rounded-xl bg-[#141414] border ${glowStyle} overflow-hidden font-sans text-neutral-300 ${className}`}
    >
      {/* Window titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-neutral-400 font-medium">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-[#FFB020] border border-[#FFB020]/20 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            {badge}
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};

/**
 * Tall Dashboard screenshot placeholder for Facts Block
 */
export const DashboardMockup: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <MockupWindow
      title="app.vault.com/acme-supplies/dashboard"
      badge="COMPANY WORKSPACE"
      accent="amber"
      className={`w-full h-full flex flex-col justify-between ${className}`}
    >
      <div className="space-y-4">
        {/* Organization Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
              COMPANY WORKSPACE
            </div>
            <div className="text-white font-semibold text-base tracking-tight flex items-center gap-2">
              Acme Industrial Supplies
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                ACTIVE
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] text-[#FFB020]">ROLE: ADMIN ACCESS</span>
            <div className="font-mono text-[11px] text-neutral-400">STATUS: ALL SYSTEMS NORMAL</div>
          </div>
        </div>

        {/* Mini stats cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="font-mono text-[10px] text-neutral-400">CATALOG SKUs</div>
            <div className="text-xl font-bold text-white mt-1">1,428</div>
            <div className="font-mono text-[9px] text-[#FFB020] mt-0.5">3 LOW-STOCK ALERTS</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="font-mono text-[10px] text-neutral-400">ACTIVE ORDERS</div>
            <div className="text-xl font-bold text-white mt-1">84</div>
            <div className="font-mono text-[9px] text-cyan-400 mt-0.5">ALL INVENTORY ALLOCATED</div>
          </div>
        </div>

        {/* Live inventory ledger snapshot */}
        <div className="rounded-lg bg-neutral-900/60 border border-neutral-800 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              RECENT ORDERS · LIVE QUEUE
            </span>
            <span className="font-mono text-[9px] text-neutral-500">SYNCHRONIZED</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between py-1 px-2 rounded bg-black/40 border border-neutral-800">
              <span className="text-white">ORD-2026-0812</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[10px]">
                CONFIRMED
              </span>
              <span className="text-neutral-400">$1,450.00</span>
            </div>
            <div className="flex items-center justify-between py-1 px-2 rounded bg-black/40 border border-neutral-800">
              <span className="text-white">ORD-2026-0813</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-950 text-[#FFB020] text-[10px]">
                DRAFT
              </span>
              <span className="text-neutral-400">$890.00</span>
            </div>
            <div className="flex items-center justify-between py-1 px-2 rounded bg-black/40 border border-neutral-800">
              <span className="text-white">ORD-2026-0814</span>
              <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 text-[10px]">
                FULFILLED
              </span>
              <span className="text-neutral-400">$3,220.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace protection footer */}
      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between font-mono text-[10px] text-neutral-500">
        <span className="flex items-center gap-1.5 text-neutral-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          PRIVATE WORKSPACE · ZERO SHARED ACCESS
        </span>
        <span className="text-neutral-400">ENCRYPTED AT REST</span>
      </div>
    </MockupWindow>
  );
};

/**
 * Products & Stock Mockup
 */
export const ProductsMockup: React.FC = () => (
  <MockupWindow title="app.vault.com/products" badge="MODULE: PRODUCTS [#01]" accent="amber">
    <div className="space-y-3 font-mono text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
        <span className="text-white font-sans font-bold">Catalog &amp; Stock Levels</span>
        <span className="text-[10px] text-[#FFB020]">520 ITEMS IN STOCK</span>
      </div>
      <table className="w-full text-left text-neutral-400 text-[11px]">
        <thead>
          <tr className="border-b border-neutral-800 text-neutral-500">
            <th className="pb-1.5">SKU</th>
            <th className="pb-1.5">ITEM NAME</th>
            <th className="pb-1.5">ON HAND</th>
            <th className="pb-1.5">STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900">
          <tr>
            <td className="py-2 text-white">SKU-VAL-109</td>
            <td className="py-2">Linear Actuator 24V</td>
            <td className="py-2 text-[#FFB020]">4 ON HAND</td>
            <td className="py-2 text-amber-400">LOW STOCK</td>
          </tr>
          <tr>
            <td className="py-2 text-white">SKU-VAL-110</td>
            <td className="py-2">Optical Sensor Head</td>
            <td className="py-2 text-white">182 ON HAND</td>
            <td className="py-2 text-emerald-400">OPTIMAL</td>
          </tr>
          <tr>
            <td className="py-2 text-white">SKU-VAL-111</td>
            <td className="py-2">Pneumatic Solenoid</td>
            <td className="py-2 text-white">65 ON HAND</td>
            <td className="py-2 text-emerald-400">OPTIMAL</td>
          </tr>
        </tbody>
      </table>
    </div>
  </MockupWindow>
);

/**
 * Orders Table Mockup with 4 order stages
 */
export const OrdersTableMockup: React.FC = () => (
  <MockupWindow title="app.vault.com/orders" badge="MODULE: ORDERS [#02]" accent="cyan">
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-800">
        <span className="text-white font-bold">Order Lifecycle Manager</span>
        <span className="font-mono text-[10px] text-cyan-400">4 STAGES: DRAFT · CONFIRMED · FULFILLED · CANCELLED</span>
      </div>
      <div className="space-y-2 font-mono text-[11px]">
        <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
          <div>
            <div className="text-white font-semibold">ORD-9021 · Acme Parts</div>
            <div className="text-[10px] text-neutral-500">3 items · $2,420.00</div>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-[#FFB020]/40 text-[#FFB020] text-[10px]">
            DRAFT (ALLOCATED)
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
          <div>
            <div className="text-white font-semibold">ORD-9019 · Nord Supplies</div>
            <div className="text-[10px] text-neutral-500">12 items · $8,140.00</div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px]">
            CONFIRMED (RESERVED)
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
          <div>
            <div className="text-white font-semibold">ORD-9016 · Precision Lab</div>
            <div className="text-[10px] text-neutral-500">1 item · $450.00</div>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-400 text-[10px]">
            FULFILLED
          </span>
        </div>
      </div>
    </div>
  </MockupWindow>
);

/**
 * Users and RBAC Mockup
 */
export const UsersRbacMockup: React.FC = () => (
  <MockupWindow title="app.vault.com/team" badge="MODULE: USERS [#03]" accent="amber">
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-800">
        <span className="text-white font-bold">Workspace Access Controls</span>
        <span className="font-mono text-[10px] text-[#FFB020]">2 ROLES: ADMIN &amp; STAFF</span>
      </div>
      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
          <div className="text-white font-bold flex items-center justify-between">
            <span>ADMIN ROLE</span>
            <span className="text-[#FFB020] text-[10px]">FULL CONTROL</span>
          </div>
          <ul className="text-neutral-400 text-[10px] space-y-1 mt-2">
            <li className="text-emerald-400">✓ Manage workspace settings</li>
            <li className="text-emerald-400">✓ Add and remove team members</li>
            <li className="text-emerald-400">✓ Full product &amp; order authority</li>
          </ul>
        </div>
        <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
          <div className="text-white font-bold flex items-center justify-between">
            <span>STAFF ROLE</span>
            <span className="text-neutral-400 text-[10px]">OPERATIONAL</span>
          </div>
          <ul className="text-neutral-400 text-[10px] space-y-1 mt-2">
            <li className="text-emerald-400">✓ Create and edit orders</li>
            <li className="text-emerald-400">✓ Record stock movements</li>
            <li className="text-neutral-500">· Focused day-to-day tools</li>
          </ul>
        </div>
      </div>
    </div>
  </MockupWindow>
);

/**
 * Reports Mockup
 */
export const ReportsMockup: React.FC = () => (
  <MockupWindow title="app.vault.com/reports" badge="MODULE: REPORTS [#04]" accent="cyan">
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-800">
        <span className="text-white font-bold">Sales &amp; Stock Valuation</span>
        <span className="font-mono text-[10px] text-cyan-400">AT A GLANCE</span>
      </div>
      <div className="grid grid-cols-3 gap-2 font-mono text-center">
        <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
          <div className="text-[9px] text-neutral-400">TOTAL STOCK VALUE</div>
          <div className="text-white text-sm font-bold mt-1">$482,910</div>
        </div>
        <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
          <div className="text-[9px] text-neutral-400">MONTHLY ORDERS</div>
          <div className="text-[#FFB020] text-sm font-bold mt-1">642</div>
        </div>
        <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
          <div className="text-[9px] text-neutral-400">STOCK TURNOVER</div>
          <div className="text-cyan-400 text-sm font-bold mt-1">4.2x</div>
        </div>
      </div>
    </div>
  </MockupWindow>
);

/**
 * History Mockup (formerly Audit)
 */
export const HistoryMockup: React.FC = () => (
  <MockupWindow title="app.vault.com/history" badge="MODULE: HISTORY [#05]" accent="amber">
    <div className="space-y-2 font-mono text-[11px]">
      <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-800 font-sans">
        <span className="text-white font-bold">Activity History Ledger</span>
        <span className="font-mono text-[10px] text-[#FFB020]">RECORDED CHANGES</span>
      </div>
      <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between items-center">
        <div>
          <span className="text-white">SKU-VAL-109</span>
          <span className="text-neutral-500 ml-2">ADJUSTMENT: -6 UNITS</span>
        </div>
        <span className="text-neutral-400 text-[10px]">Marcus · 2h ago</span>
      </div>
      <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex justify-between items-center">
        <div>
          <span className="text-white">SKU-VAL-042</span>
          <span className="text-neutral-500 ml-2">RECEIPT: +120 UNITS</span>
        </div>
        <span className="text-neutral-400 text-[10px]">Sarah · Today</span>
      </div>
    </div>
  </MockupWindow>
);

/**
 * Workspace Privacy Mockup (replaces raw SQL security filter)
 */
export const WorkspacePrivacyMockup: React.FC = () => (
  <MockupWindow title="app.vault.com/workspace/privacy" badge="PRIVATE WORKSPACE" accent="cyan">
    <div className="font-mono text-[11px] space-y-3">
      <div className="p-3.5 rounded-lg bg-black/60 border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between text-neutral-400 text-[10px]">
          <span>WORKSPACE ISOLATION STATUS</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PROTECTED
          </span>
        </div>
        <div className="font-sans text-xs text-white font-medium">
          Every company works in a private workspace. Nobody else can see your products, orders or team.
        </div>
      </div>
      <div className="p-2.5 rounded bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-[10px]">
        <span className="text-neutral-400">DATA VISIBILITY</span>
        <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white font-semibold">
          YOUR TEAM ONLY
        </span>
      </div>
    </div>
  </MockupWindow>
);

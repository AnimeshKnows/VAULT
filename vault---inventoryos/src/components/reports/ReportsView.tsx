import React from 'react';

export const ReportsView: React.FC = () => {
  const downloadReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Order #,Customer,Status,Amount,Date,Ledger Hash\n' +
      'ORD-202609220001,Rahul Mehta,Confirmed,2850,2026-09-22,HASH-882B\n' +
      'ORD-202609220002,Priya Sharma,Draft,1200,2026-09-22,HASH-882B\n' +
      'ORD-202609210015,Amit Singh,Fulfilled,4500,2026-09-21,HASH-881F\n' +
      'ORD-202609210014,Neha Verma,Cancelled,980,2026-09-21,HASH-881F\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'VAULT_Ledger_Reconciliation_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full pb-16">
      {/* Header */}
      <div className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
            <span>OPERATIONS</span>
            <span>/</span>
            <span className="text-[#82cfff]">INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Ledger Reports & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Consensus audit metrics, order fulfillment speed & stock variance telemetry
          </p>
        </div>

        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold shadow-[0_0_20px_rgba(83,86,255,0.45)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Order Velocity
          </span>
          <div className="text-3xl font-bold text-white mt-1.5 font-mono">12.4k/hr</div>
          <span className="text-xs text-[#10B981] font-mono mt-2 block">+14% vs benchmark</span>
        </div>

        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Inventory Shrinkage
          </span>
          <div className="text-3xl font-bold text-[#10B981] mt-1.5 font-mono">0.002%</div>
          <span className="text-xs text-[#94A3B8] mt-2 block">Zero unverified drift</span>
        </div>

        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Dispatch Consensus
          </span>
          <div className="text-3xl font-bold text-[#82cfff] mt-1.5 font-mono">14ms</div>
          <span className="text-xs text-[#94A3B8] mt-2 block">Fastest tier quorum</span>
        </div>

        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-5 border border-white/5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Audit Reliability
          </span>
          <div className="text-3xl font-bold text-[#c0c1ff] mt-1.5 font-mono">99.999%</div>
          <span className="text-xs text-[#10B981] font-mono mt-2 block">SHA-256 Verified</span>
        </div>
      </div>

      {/* Analytical Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-6 border border-white/5">
          <h3 className="text-base font-semibold text-white mb-1">
            Dispatch Velocity Across Multi-Channels
          </h3>
          <p className="text-xs text-[#94A3B8] mb-6">
            Real-time throughput comparison between Shopify, Amazon, and Wholesale ERP
          </p>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white">Shopify Inbound</span>
                <span className="text-[#82cfff]">48% (28 Orders)</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[#82cfff] rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white">Amazon Multi-Channel Fulfillment</span>
                <span className="text-[#5356ff]">34% (20 Orders)</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[#5356ff] rounded-full" style={{ width: '34%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white">Wholesale / Enterprise B2B</span>
                <span className="text-[#10B981]">18% (10 Orders)</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: '18%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl p-6 border border-white/5">
          <h3 className="text-base font-semibold text-white mb-1">Cryptographic Ledger Health</h3>
          <p className="text-xs text-[#94A3B8] mb-6">
            P2P node synchronization status for current cluster
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#181b25] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="font-mono text-white">NODE-01 (Primary Mumbai Hub)</span>
              </div>
              <span className="font-mono text-[#10B981]">Synced (12ms)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#181b25] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="font-mono text-white">NODE-02 (Frankfurt Mirror)</span>
              </div>
              <span className="font-mono text-[#10B981]">Synced (24ms)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#181b25] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="font-mono text-white">NODE-04 (Virginia Secondary)</span>
              </div>
              <span className="font-mono text-[#10B981]">Synced (31ms)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

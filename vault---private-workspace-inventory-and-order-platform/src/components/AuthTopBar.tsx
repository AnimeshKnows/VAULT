import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export const AuthTopBar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 flex items-center justify-between pointer-events-none select-none">
      {/* Left: VAULT wordmark linking to / */}
      <Link
        to="/"
        className="pointer-events-auto flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB020] rounded-lg p-1"
        aria-label="VAULT Home"
      >
        <div className="w-9 h-9 rounded bg-neutral-900 border border-neutral-700/80 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
          <Shield className="w-4 h-4 text-[#FFB020]" />
        </div>
        <div>
          <span className="font-mono text-base sm:text-lg font-bold tracking-widest uppercase block leading-none text-white">
            VAULT
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] tracking-wider hidden sm:block mt-1 text-neutral-400">
            PRIVATE WORKSPACE LEDGER
          </span>
        </div>
      </Link>

      {/* Right: Mono "BACK TO SITE" link */}
      <Link
        to="/"
        className="pointer-events-auto group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/70 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB020]"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-neutral-400 group-hover:text-[#FFB020]" />
        <span>BACK TO SITE</span>
      </Link>
    </header>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Linkedin, Mail, X } from 'lucide-react';

interface FooterProps {
  onOpenSignup?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSignup }) => {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="footer"
      data-theme="dark"
      className="w-full bg-[#141414] text-white border-t border-neutral-800 pt-16 sm:pt-20 pb-12 px-4 sm:px-8 lg:px-12 select-none"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 sm:pb-16 border-b border-neutral-800">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#FFB020]" />
              </div>
              <span className="font-mono text-lg font-bold tracking-widest uppercase">
                VAULT
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
              Private workspace inventory and order management for small and mid-sized businesses. Every company operates in its own protected space.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-[#FFB020] flex items-center justify-center text-neutral-300 transition-colors"
                aria-label="VAULT on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-[#FFB020] flex items-center justify-center text-neutral-300 transition-colors"
                aria-label="VAULT on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@vault-ledger.internal"
                className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-[#FFB020] flex items-center justify-center text-neutral-300 transition-colors"
                aria-label="Contact VAULT by email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Four columns with boxed mono headings */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: EXPLORE */}
            <div className="space-y-3 font-mono text-xs">
              <span className="inline-block px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 text-[10px] font-bold uppercase tracking-wider">
                [EXPLORE]
              </span>
              <ul className="space-y-2 text-neutral-400 pt-1">
                <li>
                  <button
                    onClick={() => scrollTo('capabilities')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Capabilities
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('modules')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Modules
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('security')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Security
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('how-it-works')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    How it works
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: PRODUCT */}
            <div className="space-y-3 font-mono text-xs">
              <span className="inline-block px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 text-[10px] font-bold uppercase tracking-wider">
                [PRODUCT]
              </span>
              <ul className="space-y-2 text-neutral-400 pt-1">
                <li>
                  <Link
                    to="/signup"
                    className="hover:text-white transition-colors text-left cursor-pointer inline-block"
                  >
                    Sign up
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors text-left cursor-pointer inline-block"
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('stack')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Teams
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: LEGAL */}
            <div className="space-y-3 font-mono text-xs">
              <span className="inline-block px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 text-[10px] font-bold uppercase tracking-wider">
                [LEGAL]
              </span>
              <ul className="space-y-2 text-neutral-400 pt-1">
                <li>
                  <button
                    onClick={() => setPrivacyModalOpen(true)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Privacy notice
                  </button>
                </li>
                <li>
                  <span className="text-neutral-500">Terms of service</span>
                </li>
              </ul>
            </div>

            {/* Column 4: CONTACT */}
            <div className="space-y-3 font-mono text-xs">
              <span className="inline-block px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 text-[10px] font-bold uppercase tracking-wider">
                [CONTACT]
              </span>
              <ul className="space-y-2 text-neutral-400 pt-1 break-all">
                <li>
                  <a
                    href="mailto:hello@vault-ledger.internal"
                    className="hover:text-white transition-colors"
                  >
                    hello@vault-ledger.internal
                  </a>
                </li>
                <li className="text-[10px] text-neutral-500">
                  Response within 24 business hours
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Thin rule, then '2026 VAULT' centered in mono */}
        <div className="pt-8 text-center">
          <p className="font-mono text-xs tracking-widest text-neutral-400 uppercase">
            2026 VAULT
          </p>
        </div>
      </div>

      {/* Privacy Notice Modal */}
      {privacyModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 text-left"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-sans font-bold text-xl">Workspace Privacy Notice</h3>
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 font-sans text-xs text-neutral-300 leading-relaxed">
              <p>
                Every company works in its own private workspace. Your items, prices, orders and customer details are accessible only by users you explicitly invite.
              </p>
              <p>
                We do not sell, share, or analyze your company&apos;s inventory records. Your data remains strictly your property at all times.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="px-5 py-2 rounded-full bg-white text-[#141414] font-mono text-xs uppercase font-bold cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {loginModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 text-left"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl max-w-sm w-full p-6 sm:p-8 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-sans font-bold text-xl">Sign In to Workspace</h3>
              <button
                onClick={() => setLoginModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">
                  COMPANY WORKSPACE SLUG
                </label>
                <input
                  type="text"
                  placeholder="e.g. acme-supplies"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-[#FFB020]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">
                  WORK EMAIL
                </label>
                <input
                  type="email"
                  placeholder="user@acme.com"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-[#FFB020]"
                />
              </div>
              <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#FFB020] text-[#141414] font-bold uppercase tracking-wider text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                CONTINUE TO WORKSPACE
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

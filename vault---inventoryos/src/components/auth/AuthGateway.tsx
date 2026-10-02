import React, { useState } from 'react';
import { NavigationPage } from '../../types';

interface AuthGatewayProps {
  onSuccess: () => void;
  onNavigate: (page: NavigationPage) => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onSuccess, onNavigate }) => {
  const [email, setEmail] = useState('animeshkumarpandey150@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Verifying Ledger...');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingText('Verifying Ledger...');

    setTimeout(() => {
      setLoadingText('Cryptographic Handshake OK');
      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
      }, 700);
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-transparent overflow-hidden selection:bg-[#5356ff] selection:text-white">
      {/* Top back navigation */}
      <div className="fixed top-6 left-6 z-30">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181b25]/80 hover:bg-[#262a34] text-xs font-mono text-[#94A3B8] hover:text-white border border-white/5 backdrop-blur-md transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Landing</span>
        </button>
      </div>

      {/* Central Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto overflow-hidden rounded-2xl bg-[#0a0e17]/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row my-auto">
        {/* Glow accents */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#5356ff] opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-[#82cfff] opacity-15 blur-3xl" />

        {/* LEFT PANE: Midnight Isometric Logistics & Identity Deck */}
        <div className="relative w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-between overflow-hidden bg-[#0a0e17]/60 backdrop-blur-md z-10 border-b lg:border-b-0 lg:border-r border-white/5">
          {/* Brand Header */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5356ff] to-[#4142ee] flex items-center justify-center shadow-lg shadow-[#5356ff]/30">
                <span className="material-symbols-outlined text-white text-[22px]">deployed_code</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-lg tracking-tight text-[#F1F5F9]">VAULT</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#82cfff] px-1.5 py-0.2 rounded bg-[#262a34]/80">
                    v2.4
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#94A3B8] tracking-widest uppercase">
                  InventoryOS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181b25]/80 backdrop-blur-md text-[#94A3B8] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-mono text-[10px] text-white">LEDGER LIVE</span>
            </div>
          </div>

          {/* 3D Isometric Server & Warehouse Blocks */}
          <div className="relative my-8 flex flex-col items-center justify-center">
            <div className="absolute w-72 h-44 rounded-full bg-gradient-to-t from-[#5356ff]/30 to-[#82cfff]/10 blur-2xl -bottom-6" />

            <div className="relative w-full max-w-sm h-52 flex items-center justify-center">
              <svg className="w-full h-full drop-shadow-2xl" fill="none" viewBox="0 0 460 260">
                <defs>
                  <linearGradient id="cubeTop" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#353943" />
                    <stop offset="100%" stopColor="#181b25" />
                  </linearGradient>
                  <linearGradient id="cubeLeft" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#1c2029" />
                    <stop offset="100%" stopColor="#0a0e17" />
                  </linearGradient>
                  <linearGradient id="cubeRight" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#262a34" />
                    <stop offset="100%" stopColor="#0f131c" />
                  </linearGradient>
                  <linearGradient id="neonPurple" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#3c0091" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* Base Grid Plane */}
                <path d="M 60 170 L 230 90 L 400 170 L 230 250 Z" fill="#181b25" fillOpacity="0.4" />
                <path
                  d="M 100 170 L 230 110 L 360 170 L 230 230 Z"
                  fill="none"
                  stroke="#82cfff"
                  strokeDasharray="4 4"
                  strokeOpacity="0.15"
                />

                {/* Left Cluster */}
                <g transform="translate(110, 85)">
                  <polygon fill="url(#cubeTop)" points="50,0 100,25 50,50 0,25" />
                  <polygon fill="url(#cubeLeft)" points="0,25 50,50 50,110 0,85" />
                  <polygon fill="url(#cubeRight)" points="50,50 100,25 100,85 50,110" />
                  <line stroke="#82cfff" strokeLinecap="round" strokeWidth="2" x1="8" x2="42" y1="45" y2="62" />
                  <circle cx="18" cy="50" fill="#82cfff" r="2" />
                  <circle cx="28" cy="55" fill="#5356ff" r="2" />
                  <circle cx="38" cy="60" fill="#10B981" r="2" />
                </g>

                {/* Central Main Vault Node */}
                <g transform="translate(175, 45)">
                  <polygon fill="url(#neonPurple)" points="65,0 130,32 65,64 0,32" />
                  <polygon fill="url(#cubeLeft)" points="0,32 65,64 65,150 0,118" />
                  <polygon fill="url(#cubeRight)" points="65,64 130,32 130,118 65,150" />
                  <polygon fill="#5356ff" fillOpacity="0.5" points="65,30 110,52 65,74 20,52" />
                  <line stroke="#82cfff" strokeLinecap="round" strokeWidth="2.5" x1="15" x2="52" y1="65" y2="84" />
                  <line stroke="#82cfff" strokeLinecap="round" strokeWidth="2" x1="15" x2="52" y1="85" y2="104" />
                  <circle cx="25" cy="70" fill="#82cfff" r="2.5" />
                  <circle cx="38" cy="76" fill="#c0c1ff" r="2.5" />
                  <circle cx="25" cy="90" fill="#10B981" r="2.5" />
                </g>

                {/* Right Cluster */}
                <g transform="translate(255, 95)">
                  <polygon fill="url(#cubeTop)" points="45,0 90,22 45,44 0,22" />
                  <polygon fill="url(#cubeLeft)" points="0,22 45,44 45,95 0,73" />
                  <polygon fill="url(#cubeRight)" points="45,44 90,22 90,73 45,95" />
                  <line stroke="#F59E0B" strokeLinecap="round" strokeWidth="1.5" x1="10" x2="36" y1="42" y2="55" />
                  <line stroke="#82cfff" strokeLinecap="round" strokeWidth="1.5" x1="10" x2="36" y1="60" y2="73" />
                </g>
              </svg>
            </div>

            {/* Floating Micro Badge */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#262a34]/90 backdrop-blur-md shadow-xl border border-white/10 -mt-2 z-20">
              <span className="material-symbols-outlined text-[#82cfff] text-[20px]">hub</span>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] text-white tracking-wide font-semibold">
                  MULTITENANT LEDGER
                </span>
                <span className="text-[11px] text-[#94A3B8]">4,820 live SKU streams synced</span>
              </div>
            </div>
          </div>

          {/* Left Bottom Copy */}
          <div className="relative z-20 pt-2">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-xs text-[#94A3B8] max-w-md leading-relaxed">
              Sign in to your enterprise workspace to continue orchestrating high-velocity inventory, dispatch ledgers, and global SKU channels.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="p-2.5 rounded-lg bg-[#181b25]/80 border border-white/5 flex flex-col">
                <span className="font-mono text-[10px] text-[#94A3B8] uppercase">Uptime</span>
                <span className="font-mono text-xs text-white font-semibold mt-0.5">99.98%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181b25]/80 border border-white/5 flex flex-col">
                <span className="font-mono text-[10px] text-[#94A3B8] uppercase">Sync Rate</span>
                <span className="font-mono text-xs text-[#82cfff] font-semibold mt-0.5">24ms</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181b25]/80 border border-white/5 flex flex-col">
                <span className="font-mono text-[10px] text-[#94A3B8] uppercase">Encryption</span>
                <span className="font-mono text-xs text-[#10B981] font-semibold mt-0.5">TLS 1.3</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Elevated Glassmorphic Sign-In Console */}
        <div className="relative w-full lg:w-5/12 p-8 md:p-12 flex flex-col justify-center bg-[#181b25]/75 backdrop-blur-xl z-20">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#31353f]/80 border border-white/5 text-[#c0c1ff] font-mono text-[11px] font-semibold mb-3">
              <span className="material-symbols-outlined text-[14px]">lock_open</span>
              <span>ENTERPRISE PORTAL</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Enter your credentials to access your account workspace.
            </p>
          </div>

          {/* Quick SSO Row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={onSuccess}
              className="flex items-center justify-center gap-2 h-10 px-3 rounded-lg bg-[#262a34] hover:bg-[#31353f] border border-white/5 text-white text-xs font-medium transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span>Google SSO</span>
            </button>
            <button
              type="button"
              onClick={onSuccess}
              className="flex items-center justify-center gap-2 h-10 px-3 rounded-lg bg-[#262a34] hover:bg-[#31353f] border border-white/5 text-white text-xs font-medium transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-[#82cfff]">vpn_key</span>
              <span>SAML / Okta</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="w-full h-px bg-white/10" />
            <span className="absolute px-3 bg-[#181b25] font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white">Work Email</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#94A3B8] pointer-events-none text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#080B11]/90 border border-white/10 text-white placeholder:text-[#475569] text-xs focus:outline-none focus:ring-1 focus:ring-[#5356ff] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-white">Password</label>
                <a href="#" className="text-[11px] text-[#82cfff] hover:text-[#c0c1ff] transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#94A3B8] pointer-events-none text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-10 pl-10 pr-10 rounded-lg bg-[#080B11]/90 border border-white/10 text-white placeholder:text-[#475569] text-xs focus:outline-none focus:ring-1 focus:ring-[#5356ff] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#94A3B8] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#31353f] accent-[#5356ff] cursor-pointer"
                />
                <span className="text-[11px] text-[#94A3B8]">Remember device for 30 days</span>
              </label>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 px-4 rounded-lg bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(83,86,255,0.4)] hover:shadow-[0_0_24px_rgba(83,86,255,0.6)] active:scale-[0.99] transition-all disabled:opacity-75"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>{loadingText}</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </>
                )}
              </button>

              {/* Quick shortcut demo launch */}
              <button
                type="button"
                onClick={onSuccess}
                className="w-full h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[#c0c1ff] text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                <span>Fast Demo Access (Admin Console)</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#94A3B8]">
              Don&apos;t have an enterprise account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="text-[#5356ff] hover:text-[#c0c1ff] underline underline-offset-4 decoration-[#5356ff]/40 font-medium"
              >
                Register your business
              </button>
            </p>
          </div>

          <div className="mt-6 pt-4 flex items-center justify-between text-[#475569] text-[10px] font-mono border-t border-white/5">
            <span>SOC2 TYPE II CERTIFIED</span>
            <div className="flex items-center gap-2">
              <a href="#" className="hover:text-[#94A3B8]">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-[#94A3B8]">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-[#94A3B8]">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

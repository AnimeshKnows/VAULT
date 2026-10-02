import React, { useState } from 'react';
import { NavigationPage } from '../../types';
import { login } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { getTenantId } from '../../lib/auth/session';

interface ShutterLoginProps {
  onSuccess: () => void;
  onNavigate: (page: NavigationPage) => void;
  onStateChange?: (state: 'default' | 'locked' | 'unlocked') => void;
}

export const ShutterLogin: React.FC<ShutterLoginProps> = ({
  onSuccess,
  onNavigate,
  onStateChange,
}) => {
  const [tenantId, setTenantId] = useState(getTenantId() ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States:
  // 'idle'             -> Form is visible, shutter closed & locked
  // 'validating'       -> Form vanishes immediately! Shutter in clear view, verifying credentials
  // 'unlocking'        -> Valid: Mechanical lock pins retract, turns emerald green
  // 'lifting'          -> Valid: Shutter lifts upward into ceiling drum, revealing the environment
  // 'attempt_lifting'  -> Invalid: Shutter tries to lift slightly, motor strains
  // 'jammed'           -> Invalid: Lock holds tight, flashes red, shutter shudders & bounces back down
  const [authStage, setAuthStage] = useState<
    'idle' | 'validating' | 'unlocking' | 'lifting' | 'attempt_lifting' | 'jammed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const playSuccessSequence = () => {
    setAuthStage('unlocking');
    if (onStateChange) onStateChange('unlocked');

    setTimeout(() => {
      setAuthStage('lifting');
      setTimeout(() => {
        onSuccess();
      }, 1400);
    }, 900);
  };

  const playFailureSequence = (message: string) => {
    setAuthStage('attempt_lifting');

    setTimeout(() => {
      setAuthStage('jammed');
      if (onStateChange) onStateChange('locked');

      setTimeout(() => {
        setAuthStage('idle');
        setErrorMessage(message);
      }, 1800);
    }, 700);
  };

  // Handle Form Submission — authenticates against InventoryOS API
  const processCredentials = async (isForcedInvalid = false) => {
    if (authStage !== 'idle') return;

    setAuthStage('validating');
    setErrorMessage('');
    if (onStateChange) onStateChange('locked');

    if (isForcedInvalid) {
      setTimeout(() => {
        playFailureSequence(
          'ACCESS DENIED // DEMO REFUSAL: Forced invalid probe. The blast shutter refused to unlock.'
        );
      }, 700);
      return;
    }

    if (!tenantId.trim()) {
      setTimeout(() => {
        playFailureSequence(
          'ACCESS DENIED // TENANT REQUIRED: Paste the Tenant ID returned at registration (login is scoped per tenant).'
        );
      }, 700);
      return;
    }

    try {
      await login({
        tenantId: tenantId.trim(),
        email: email.trim(),
        password,
      });
      playSuccessSequence();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to reach VAULT API. Is the backend running?';
      playFailureSequence(`ACCESS DENIED // ${message}`);
    }
  };

  const isFormVanished = authStage !== 'idle';
  const isUnlocking = authStage === 'unlocking';
  const isLifting = authStage === 'lifting';
  const isAttemptLifting = authStage === 'attempt_lifting';
  const isJammed = authStage === 'jammed';

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC SHUTTER STATUS TELEMETRY OVERLAY (WHEN FORM VANISHES)        */}
      {/* ========================================================================= */}
      {authStage !== 'idle' && (
        <div className="fixed top-8 inset-x-0 mx-auto w-fit z-50 px-6 py-3 rounded-2xl bg-black/85 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
          {authStage === 'validating' ? (
            <>
              <div>
                <span className="font-mono text-xs font-bold text-white tracking-wider block">
                  AUTHENTICATING CREDENTIALS // CIPHER MATCHING...
                </span>
                <span className="font-mono text-[10px] text-[#82cfff]">
                  Interrogating cryptographic security token...
                </span>
              </div>
            </>
          ) : authStage === 'unlocking' ? (
            <>
              <div>
                <span className="font-mono text-xs font-bold text-[#10B981] tracking-wider block">
                  CREDENTIALS CONFIRMED // DISENGAGING PHYSICAL LOCK
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8]">
                  Deadbolt pins retracting • Hydraulic pressure released
                </span>
              </div>
            </>
          ) : authStage === 'lifting' ? (
            <>
              <span className="material-symbols-outlined text-[20px] text-[#10B981]">
                arrow_upward
              </span>
              <div>
                <span className="font-mono text-xs font-bold text-white tracking-wider block">
                  BLAST SHUTTER OPEN // ACCESS GRANTED
                </span>
                <span className="font-mono text-[10px] text-[#10B981]">
                  Entering live digital vault environment...
                </span>
              </div>
            </>
          ) : authStage === 'attempt_lifting' ? (
            <>
              <div>
                <span className="font-mono text-xs font-bold text-[#F59E0B] tracking-wider block">
                  SHUTTER MOTOR ENGAGED // ATTEMPTING DISPATCH...
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8]">
                  Testing blast gate clearance...
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px] text-[#EF4444]">
                gpp_bad
              </span>
              <div>
                <span className="font-mono text-xs font-bold text-[#EF4444] tracking-wider block">
                  ACCESS REFUSED // BLAST LOCK HELD FIRM
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8]">
                  Shutter prevented from opening • Returning to console...
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SHUTTER & GATE CONTAINER (PHYSICAL BARRIER BLOCKING ENVIRONMENT)      */}
      {/* ========================================================================= */}
      <div
        className={`fixed inset-0 pointer-events-none transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 ${
          isLifting
            ? '-translate-y-[105%]'
            : isAttemptLifting
            ? '-translate-y-8 sm:-translate-y-10 transition-transform duration-500 ease-out'
            : isJammed
            ? 'translate-y-0 transition-transform duration-300'
            : 'translate-y-0'
        }`}
      >
        {/* Shutter Slats Assembly */}
        <div
          className={`w-full h-full relative flex flex-col justify-between bg-gradient-to-b from-[#0a0e17] via-[#0d131f] to-[#080b12] shadow-2xl transition-all ${
            isJammed ? 'animate-[shake_0.25s_ease-in-out_3]' : ''
          }`}
        >
          {/* Top nav bar with in-app back control */}
          <div className="w-full h-12 bg-[#0f1422] border-b border-white/10 flex items-center justify-between px-4 sm:px-8 shadow-inner pointer-events-auto">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Back"
                aria-label="Back"
              >
                <span className="text-base font-medium leading-none">&lt;</span>
              </button>
              <span className="font-mono text-[11px] sm:text-xs tracking-widest text-[#94A3B8] uppercase truncate">
                VAULT SECURITY BLAST SHUTTER // GATE SECTOR 01
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-[#64748B] shrink-0">
              <span className="hidden sm:inline">MOTOR TORQUE: 1850 NM</span>
              <span
                className={`px-2 py-0.5 rounded border text-[9px] ${
                  isUnlocking || isLifting
                    ? 'border-[#10B981]/50 text-[#10B981] bg-[#10B981]/10'
                    : isJammed
                    ? 'border-[#EF4444]/50 text-[#EF4444] bg-[#EF4444]/10'
                    : 'border-white/10 text-[#94A3B8]'
                }`}
              >
                {isUnlocking || isLifting
                  ? 'CLEAR'
                  : isJammed
                  ? 'JAMMED / REFUSED'
                  : 'INTERLOCK ARMED'}
              </span>
            </div>
          </div>

          {/* Heavy Metallic Slats with Seams and Laser Vision Slits */}
          <div className="flex-1 w-full flex flex-col justify-evenly opacity-95 relative overflow-hidden">
            {/* Ambient metallic reflection & spotlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />

            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-7 border-b border-white/[0.07] bg-[#0c111c]/90 flex items-center justify-between px-6 relative group"
              >
                {/* Rivets on left & right */}
                <div className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20 shadow-inner" />
                  <span className="w-1 h-1 rounded-full bg-white/20 shadow-inner" />
                </div>

                {/* Laser Vision Slits: Environment behind is partially visible */}
                <div className="flex-1 mx-6 sm:mx-12 h-1 rounded-full bg-[#080B11]/90 flex items-center justify-center overflow-hidden border border-white/[0.04]">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#5356ff]/40 to-transparent blur-[0.5px]" />
                </div>

                <div className="flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20 shadow-inner" />
                  <span className="w-1 h-1 rounded-full bg-white/20 shadow-inner" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Heavy Steel Bumper with Hydraulic Floor Stopper */}
          <div className="w-full h-14 bg-[#090d16] border-t-2 border-white/10 flex items-center justify-between px-6 sm:px-10">
            <span className="font-mono text-[10px] text-[#64748B]">FLOOR HYDRAULIC ANCHORS</span>
            <span className="font-mono text-[10px] text-[#64748B]">
              BEARING FORCE: 120,000 N • REINFORCED TITANIUM
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. PHYSICAL MECHANICAL LOCK MECHANISM (MOUNTED DIRECTLY ON THE SHUTTER)   */}
        {/* ========================================================================= */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Left Horizontal Locking Crossbolt Bar */}
            <div
              className={`h-4.5 bg-gradient-to-r from-[#262a34] via-[#1c202a] to-[#181b25] border border-white/20 rounded-l-md shadow-2xl transition-all duration-700 origin-right ${
                isUnlocking || isLifting
                  ? 'w-0 opacity-0'
                  : isJammed
                  ? 'w-48 sm:w-72 opacity-100 border-[#EF4444]/60 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : 'w-48 sm:w-64 opacity-100'
              }`}
            />

            {/* Central High-Tech Lock Housing Core */}
            <div
              className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-[#0f1422] border-2 transition-all duration-500 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.95)] ${
                isUnlocking || isLifting
                  ? 'border-[#10B981] shadow-[0_0_45px_rgba(16,185,129,0.7)] rotate-45 scale-105'
                  : isJammed
                  ? 'border-[#EF4444] shadow-[0_0_50px_rgba(239,68,68,0.9)] animate-[shake_0.2s_ease-in-out_4] scale-105'
                  : isAttemptLifting
                  ? 'border-[#F59E0B] shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                  : 'border-[#5356ff]/40 shadow-[0_0_30px_rgba(83,86,255,0.3)]'
              }`}
            >
              {/* Rotating biometric/locking ring */}
              <div
                className={`absolute inset-2.5 rounded-2xl border border-dashed transition-transform duration-700 ${
                  isUnlocking || isLifting
                    ? 'border-[#10B981] rotate-180'
                    : isJammed
                    ? 'border-[#EF4444] rotate-45'
                    : 'border-white/20 animate-[spin_12s_linear_infinite]'
                }`}
              />

              {/* Status Icon */}
              <span
                className={`material-symbols-outlined text-[40px] transition-colors duration-300 ${
                  isUnlocking || isLifting
                    ? 'text-[#10B981]'
                    : isJammed
                    ? 'text-[#EF4444]'
                    : 'text-[#c0c1ff]'
                }`}
              >
                {isUnlocking || isLifting
                  ? 'lock_open'
                  : isJammed
                  ? 'gpp_bad'
                  : authStage === 'validating' || isAttemptLifting
                  ? 'lock_clock'
                  : 'lock'}
              </span>

              {/* Status Label */}
              <span
                className={`font-mono text-[9px] font-bold uppercase tracking-wider mt-1.5 transition-colors duration-300 ${
                  isUnlocking || isLifting
                    ? 'text-[#10B981]'
                    : isJammed
                    ? 'text-[#EF4444]'
                    : 'text-[#94A3B8]'
                }`}
              >
                {isUnlocking || isLifting
                  ? 'UNLOCKED'
                  : isJammed
                  ? 'REFUSED'
                  : isAttemptLifting
                  ? 'HOLDING'
                  : authStage === 'validating'
                  ? 'VERIFYING'
                  : 'LOCKED'}
              </span>
            </div>

            {/* Right Horizontal Locking Crossbolt Bar */}
            <div
              className={`h-4.5 bg-gradient-to-l from-[#262a34] via-[#1c202a] to-[#181b25] border border-white/20 rounded-r-md shadow-2xl transition-all duration-700 origin-left ${
                isUnlocking || isLifting
                  ? 'w-0 opacity-0'
                  : isJammed
                  ? 'w-48 sm:w-72 opacity-100 border-[#EF4444]/60 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : 'w-48 sm:w-64 opacity-100'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FOREGROUND LOGIN TERMINAL CONSOLE                                      */}
      {/* (VANISHES WHEN "UNLOCK SHUTTER & ENTER" IS CLICKED; REAPPEARS ON FAILURE) */}
      {/* ========================================================================= */}
      <div
        className={`relative z-30 w-full max-w-md mx-auto my-auto transition-all duration-700 ease-out ${
          isFormVanished
            ? 'opacity-0 scale-90 translate-y-12 pointer-events-none'
            : 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
        }`}
      >
        <div className="rounded-3xl bg-black/40 backdrop-blur-xl border border-white/20 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.25)]">
          {/* Header */}
          <div className="flex items-center pb-3.5 border-b border-white/10 mb-5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#c0c1ff]">
              ACCESS GATEWAY TERMINAL
            </span>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white tracking-tight">Identity Verification</h2>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Submit administrative credentials. When submitted, this console vanishes so you can witness the physical blast shutter and lock unlock or refuse entry.
            </p>
          </div>

          {/* Visual Refusal Alert if failed and form reappeared */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-start gap-2.5 text-xs text-[#EF4444] font-mono animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
              <div>
                <span className="font-bold block">ACCESS REFUSED</span>
                <span className="text-[11px] text-white/80">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void processCredentials(false);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-[#c0c1ff] mb-1 font-medium">Tenant ID</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#94A3B8] text-[18px]">
                  apartment
                </span>
                <input
                  type="text"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  required
                  disabled={authStage !== 'idle'}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-black/40 hover:bg-black/60 focus:bg-black/70 border border-white/20 text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-[#82cfff] focus:border-[#82cfff] transition-all disabled:opacity-50 placeholder-white/30 backdrop-blur-sm"
                />
              </div>
              <p className="mt-1 text-[10px] text-[#94A3B8] font-mono">
                Saved automatically after signup. Required because emails are unique per tenant.
              </p>
            </div>

            <div>
              <label className="block text-[#c0c1ff] mb-1 font-medium">Work Identifier / Email</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#94A3B8] text-[18px]">
                  account_circle
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vault.io"
                  required
                  disabled={authStage !== 'idle'}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-black/40 hover:bg-black/60 focus:bg-black/70 border border-white/20 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#82cfff] focus:border-[#82cfff] transition-all disabled:opacity-50 placeholder-white/30 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#c0c1ff] mb-1 font-medium">Administrative Keyphrase</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#94A3B8] text-[18px]">
                  key
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={authStage !== 'idle'}
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-black/40 hover:bg-black/60 focus:bg-black/70 border border-white/20 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#82cfff] focus:border-[#82cfff] transition-all disabled:opacity-50 placeholder-white/30 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#94A3B8] hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={authStage !== 'idle'}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#5356ff] to-[#4142ee] hover:from-[#6467ff] hover:to-[#5152fa] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(83,86,255,0.45)] hover:shadow-[0_0_35px_rgba(83,86,255,0.65)] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 border border-white/20"
              >
                <span>Unlock Shutter & Enter</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

            </div>
          </form>

          {/* Switch to Signup / Apartment Assignment */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-[#94A3B8]">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="text-[#82cfff] hover:text-white font-medium underline underline-offset-4 decoration-[#82cfff]/40 transition-colors cursor-pointer"
              >
                Sign up →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

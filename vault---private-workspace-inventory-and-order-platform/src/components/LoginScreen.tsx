import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthTopBar } from './AuthTopBar';
import { SectionTag } from './SectionTag';
import { VaultPillButton } from './VaultPillButton';
import { Eye, EyeOff, Lock, AlertCircle, ArrowUpRight, SkipForward } from 'lucide-react';
import {
  isAuthenticated,
  getStoredTenantId,
  isValidGuid,
  apiLogin,
  storeAuthSession,
  enterAuthenticatedShell,
  loadWorkspace,
} from '../utils/auth';

type ShutterState = 'idle' | 'validating' | 'success' | 'failure';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();

  // Route guard: guest-only
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Form states
  const [workspaceId, setWorkspaceId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Prefill workspaceId from localStorage key vault.tenantId if present
  useEffect(() => {
    const stored = getStoredTenantId();
    if (stored) {
      setWorkspaceId(stored);
    }
  }, []);

  // Inline validation errors
  const [errors, setErrors] = useState<{
    workspaceId?: string;
    email?: string;
    password?: string;
    server?: string;
  }>({});

  // Animation / lifecycle state
  const [state, setState] = useState<ShutterState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Field refs for moving focus to first invalid field
  const workspaceIdRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  // Check prefers-reduced-motion
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile detection for slat count (18 vs 10)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show "SKIP" button after 1s during any animation sequence
  useEffect(() => {
    let skipTimer: any;
    if (state !== 'idle') {
      skipTimer = setTimeout(() => {
        setShowSkip(true);
      }, 1000);
    } else {
      setShowSkip(false);
    }
    return () => clearTimeout(skipTimer);
  }, [state]);

  const handleSkip = () => {
    if (state === 'success' || state === 'validating') {
      navigate('/dashboard');
    } else if (state === 'failure') {
      setState('idle');
      setIsSubmitting(false);
    }
  };

  // Client validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Workspace ID validation
    if (!workspaceId.trim()) {
      newErrors.workspaceId = 'Paste the Workspace ID you received when you signed up.';
    } else if (!isValidGuid(workspaceId)) {
      newErrors.workspaceId = 'That Workspace ID does not look right.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Enter your work email address.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Enter your password.';
    }

    setErrors(newErrors);

    // Accessibility: Focus first invalid field
    if (newErrors.workspaceId) {
      workspaceIdRef.current?.focus();
      return false;
    }
    if (newErrors.email) {
      emailRef.current?.focus();
      return false;
    }
    if (newErrors.password) {
      passwordRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submits

    setErrors({});
    if (!validateForm()) return;

    setIsSubmitting(true);
    setState('validating');

    try {
      // Minimum duration for validating sequence visual clarity
      const [authResponse] = await Promise.all([
        apiLogin({
          tenantId: workspaceId.trim(),
          email: email.trim(),
          password,
        }),
        new Promise((resolve) => setTimeout(resolve, isReducedMotion ? 400 : 1200)),
      ]);

      // Success sequence
      setState('success');
      storeAuthSession(authResponse);

      const delayBeforeNav = isReducedMotion ? 300 : 2200;
      setTimeout(() => {
        enterAuthenticatedShell();
        navigate('/dashboard');
        loadWorkspace();
      }, delayBeforeNav);
    } catch (err: any) {
      // Failure sequence
      setState('failure');
      const errorMsg =
        err?.status === 429
          ? 'Too many attempts. Please wait a few minutes and try again.'
          : 'Invalid email, password, or workspace ID.';

      setTimeout(
        () => {
          setState('idle');
          setIsSubmitting(false);
          setErrors({ server: errorMsg });
        },
        isReducedMotion ? 500 : 1800
      );
    }
  };

  const slatCount = isMobile ? 10 : 18;
  const slats = Array.from({ length: slatCount });

  return (
    <div className="relative min-h-screen w-full bg-[#141414] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-sans">
      {/* Top Bar */}
      <AuthTopBar />

      {/* BACKGROUND: INDUSTRIAL BLAST SHUTTER */}
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden transition-all ${
          state === 'failure' ? 'animate-shutter-shake' : ''
        }`}
        aria-hidden="true"
      >
        {/* Soft light flooding in from behind on success */}
        <div
          className={`absolute inset-0 bg-radial from-amber-100/40 via-white/10 to-transparent transition-opacity duration-1000 ${
            state === 'success' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Ambient light sweep over shutter metal */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent w-[200%] animate-ambient-sweep pointer-events-none" />

        {/* Slats container */}
        <div
          className={`relative w-full h-full flex flex-col justify-between transition-transform ${
            state === 'success'
              ? 'duration-[1600ms] ease-[cubic-bezier(0.7,0,0.3,1)] -translate-y-[108%]'
              : state === 'failure'
              ? 'duration-300 -translate-y-[6%]'
              : 'duration-500 translate-y-0'
          }`}
        >
          {slats.map((_, i) => (
            <div
              key={i}
              style={{
                transitionDelay:
                  state === 'success' ? `${i * 40}ms` : '0ms',
              }}
              className="relative flex-1 w-full bg-gradient-to-b from-[#242424] via-[#1b1b1b] to-[#121212] border-b border-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] flex items-center justify-between px-3 sm:px-6 transition-transform duration-700"
            >
              {/* Left edge rivets */}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)]" />
              </div>

              {/* Center subtle laser slit between slats */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFB020]/25 to-transparent" />

              {/* Right edge rivets */}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)]" />
              </div>
            </div>
          ))}
        </div>

        {/* Red edge glow on failure */}
        {state === 'failure' && (
          <div className="absolute inset-0 border-4 border-[#F87171]/50 shadow-[inset_0_0_80px_rgba(248,113,113,0.3)] transition-opacity duration-300" />
        )}

        {/* Central circular blast lock with two crossbolts */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Horizontal Crossbolts */}
            <div
              className={`absolute h-4 sm:h-5 bg-gradient-to-b from-neutral-600 via-neutral-700 to-neutral-900 border border-neutral-700/80 rounded-sm shadow-2xl transition-all duration-700 ${
                state === 'success'
                  ? 'w-16 opacity-0 scale-x-50'
                  : 'w-64 sm:w-80 opacity-90'
              }`}
            />

            {/* Circular Vault Lock Body */}
            <div
              className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 bg-[#171717] shadow-[0_0_50px_rgba(0,0,0,0.9),inset_0_2px_6px_rgba(255,255,255,0.15)] flex items-center justify-center transition-all duration-700 ${
                state === 'validating'
                  ? 'border-[#FFB020] shadow-[0_0_35px_rgba(255,176,32,0.35)] rotate-180 animate-spin-slow'
                  : state === 'success'
                  ? 'border-[#34D399] shadow-[0_0_40px_rgba(52,211,153,0.4)] rotate-90'
                  : state === 'failure'
                  ? 'border-[#F87171] shadow-[0_0_40px_rgba(248,113,113,0.4)] animate-pulse'
                  : 'border-neutral-700'
              }`}
            >
              {/* Radial notched dial ring */}
              <div className="absolute inset-2 rounded-full border border-neutral-800/80 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-neutral-950 border border-neutral-700/60 flex items-center justify-center">
                  <Lock
                    className={`w-6 h-6 transition-colors duration-300 ${
                      state === 'validating'
                        ? 'text-[#FFB020]'
                        : state === 'success'
                        ? 'text-[#34D399]'
                        : state === 'failure'
                        ? 'text-[#F87171]'
                        : 'text-neutral-400'
                    }`}
                  />
                </div>
              </div>

              {/* Status perimeter notches */}
              <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <div className="absolute left-1 w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-neutral-600" />
            </div>
          </div>
        </div>
      </div>

      {/* TELEMETRY TEXT WHEN VALIDATING */}
      {state === 'validating' && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 font-mono text-xs sm:text-sm tracking-widest text-[#FFB020] uppercase flex items-center gap-2 bg-black/80 px-4 py-2 rounded-full border border-[#FFB020]/30 shadow-xl"
        >
          <span className="w-2 h-2 rounded-full bg-[#FFB020] animate-ping" />
          <span>AUTHENTICATING...</span>
          <span className="inline-block w-1.5 h-4 bg-[#FFB020] animate-pulse" />
        </div>
      )}

      {/* SKIP ANIMATION BUTTON (appears after 1s during sequence) */}
      {showSkip && state !== 'idle' && (
        <button
          onClick={handleSkip}
          className="fixed bottom-4 right-4 z-40 px-3 py-1.5 rounded-full bg-black/80 hover:bg-neutral-800 border border-white/20 font-mono text-[11px] uppercase tracking-wider text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          aria-label="Skip animation sequence"
        >
          <SkipForward className="w-3 h-3 text-[#FFB020]" />
          <span>SKIP</span>
        </button>
      )}

      {/* CENTERED FROSTED-GLASS FORM CARD */}
      <div
        className={`relative z-20 w-full max-w-[440px] transition-all duration-500 ${
          state !== 'idle'
            ? 'opacity-0 pointer-events-none scale-95 translate-y-4'
            : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <div className="rounded-[16px] bg-[#141414]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl">
          {/* Section Tag */}
          <SectionTag index="S.01" label="ACCESS" theme="dark" />

          {/* Headline */}
          <h1 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-[-0.03em] leading-tight mt-1 mb-6">
            Open your workspace.
          </h1>

          {/* Server / Auth Error Banner */}
          {errors.server && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-5 p-3 rounded-lg bg-red-950/40 border border-[#F87171]/40 text-[#F87171] text-xs font-mono flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block tracking-wider uppercase text-[10px]">
                  ACCESS REFUSED
                </span>
                <span className="font-sans text-neutral-300 mt-0.5 block">
                  {errors.server}
                </span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* WORKSPACE ID */}
            <div>
              <label
                htmlFor="login-workspace-id"
                className="block font-mono text-xs uppercase tracking-wider text-neutral-300 mb-1.5"
              >
                WORKSPACE ID
              </label>
              <input
                id="login-workspace-id"
                ref={workspaceIdRef}
                type="text"
                autoComplete="off"
                spellCheck="false"
                value={workspaceId}
                onChange={(e) => {
                  setWorkspaceId(e.target.value);
                  if (errors.workspaceId) {
                    setErrors((prev) => ({ ...prev, workspaceId: undefined }));
                  }
                }}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                aria-invalid={!!errors.workspaceId}
                aria-describedby={
                  errors.workspaceId
                    ? 'workspace-id-error'
                    : 'workspace-id-helper'
                }
                className={`w-full h-11 px-3.5 rounded-lg bg-neutral-950/80 border text-white font-mono text-xs sm:text-sm tracking-wide transition-all placeholder:text-neutral-600 focus:outline-none ${
                  errors.workspaceId
                    ? 'border-[#F87171] focus:ring-1 focus:ring-[#F87171]'
                    : 'border-white/10 focus:border-[#FFB020] focus:ring-1 focus:ring-[#FFB020]'
                }`}
              />
              {errors.workspaceId ? (
                <p
                  id="workspace-id-error"
                  role="alert"
                  className="font-mono text-[11px] text-[#F87171] mt-1.5"
                >
                  {errors.workspaceId}
                </p>
              ) : (
                <p
                  id="workspace-id-helper"
                  className="font-mono text-[10px] text-neutral-400 mt-1"
                >
                  You received this when you created your workspace.
                </p>
              )}
            </div>

            {/* WORK EMAIL */}
            <div>
              <label
                htmlFor="login-email"
                className="block font-mono text-xs uppercase tracking-wider text-neutral-300 mb-1.5"
              >
                WORK EMAIL
              </label>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="alex@company.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full h-11 px-3.5 rounded-lg bg-neutral-950/80 border text-white font-sans text-sm transition-all placeholder:text-neutral-600 focus:outline-none ${
                  errors.email
                    ? 'border-[#F87171] focus:ring-1 focus:ring-[#F87171]'
                    : 'border-white/10 focus:border-[#FFB020] focus:ring-1 focus:ring-[#FFB020]'
                }`}
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="font-mono text-[11px] text-[#F87171] mt-1.5"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block font-mono text-xs uppercase tracking-wider text-neutral-300"
                >
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-neutral-200 text-xs font-mono uppercase flex items-center gap-1 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>HIDE</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>SHOW</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="••••••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  className={`w-full h-11 px-3.5 rounded-lg bg-neutral-950/80 border text-white font-sans text-sm transition-all placeholder:text-neutral-600 focus:outline-none ${
                    errors.password
                      ? 'border-[#F87171] focus:ring-1 focus:ring-[#F87171]'
                      : 'border-white/10 focus:border-[#FFB020] focus:ring-1 focus:ring-[#FFB020]'
                  }`}
                />
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="font-mono text-[11px] text-[#F87171] mt-1.5"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Primary Pill: UNLOCK AND ENTER */}
            <div className="pt-2">
              <VaultPillButton
                type="submit"
                label={isSubmitting ? 'VERIFYING...' : 'UNLOCK AND ENTER'}
                variant="light"
                className="w-full justify-between"
              />
            </div>
          </form>

          {/* Footer link to Signup */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center font-mono text-xs text-neutral-400">
            <span>New here? </span>
            <Link
              to="/signup"
              className="text-white hover:text-[#FFB020] font-semibold transition-colors underline underline-offset-4 decoration-neutral-700 hover:decoration-[#FFB020]"
            >
              CREATE A WORKSPACE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

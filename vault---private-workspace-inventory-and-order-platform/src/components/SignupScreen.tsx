import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthTopBar } from './AuthTopBar';
import { SectionTag } from './SectionTag';
import { VaultPillButton } from './VaultPillButton';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Building2,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import {
  isAuthenticated,
  apiRegister,
  storeAuthSession,
  enterAuthenticatedShell,
  loadWorkspace,
} from '../utils/auth';

type TowerState = 'idle' | 'scanning' | 'assigning' | 'completed' | 'failure';
type AssignPhase = 'lift' | 'center' | 'name' | 'seal';

const VACANT_WINDOWS = [3, 8, 14, 19, 23, 27];

/** Word-by-word reveal matching ScrollWordReveal, driven by time instead of scroll. */
const TimedWordReveal: React.FC<{
  text: string;
  active: boolean;
  className?: string;
}> = ({ text, active, className = '' }) => {
  const words = text.split(/\s+/).filter(Boolean);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !active) {
    return (
      <p className={className}>
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className="inline-block mr-[0.28em] text-white">
            {w}
          </span>
        ))}
      </p>
    );
  }

  return (
    <p className={className} aria-live="polite">
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0.22, color: '#525252' }}
          animate={{ opacity: 1, color: '#FFFFFF' }}
          transition={{
            duration: 0.4,
            delay: i * 0.11,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block mr-[0.28em] select-none"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
};
export const SignupScreen: React.FC = () => {
  const navigate = useNavigate();

  // Route guard: guest-only
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<{
    companyName?: string;
    fullName?: string;
    email?: string;
    password?: string;
    server?: string;
  }>({});

  // Lifecycle states
  const [state, setState] = useState<TowerState>('idle');
  const [assignPhase, setAssignPhase] = useState<AssignPhase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedUnit, setAssignedUnit] = useState('UNIT 4C');
  const [assignedWindowIndex, setAssignedWindowIndex] = useState(14);
  const [generatedTenantId, setGeneratedTenantId] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoEnterActive, setAutoEnterActive] = useState(true);
  const [countdownPercent, setCountdownPercent] = useState(100);
  const [showSkip, setShowSkip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cubeOrigin, setCubeOrigin] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Mouse parallax coordinates
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Field refs for focus management
  const companyNameRef = useRef<HTMLInputElement | null>(null);
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const windowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const pendingAuthRef = useRef<Awaited<ReturnType<typeof apiRegister>> | null>(null);
  const skipSequenceRef = useRef(false);

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile detection (4x5 vs 5x6 grid)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse parallax handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isReducedMotion) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
    const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    setMouseOffset({ x, y });
  };

  // Live slug generation for workspace address preview
  const slug = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'company-name';
  const workspaceAddressPreview = `${slug}.vault-os.net`;

  // Password strength calculation
  const getPasswordStrength = (pass: string): { label: string; score: number; color: string } => {
    if (!pass) return { label: '', score: 0, color: 'bg-neutral-800' };
    if (pass.length < 8) return { label: 'TOO SHORT', score: 1, color: 'bg-[#F87171]' };
    let score = 1;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { label: 'WEAK', score: 2, color: 'bg-[#F87171]' };
    if (score <= 4) return { label: 'GOOD', score: 4, color: 'bg-[#FFB020]' };
    return { label: 'STRONG', score: 5, color: 'bg-[#34D399]' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Client validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Company name: required, max 100
    if (!companyName.trim()) {
      newErrors.companyName = 'Enter your company name.';
    } else if (companyName.trim().length > 100) {
      newErrors.companyName = 'Company name must be 100 characters or fewer.';
    }

    // Full name: required, split on first space into first and last name
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = 'Enter both your first and last name.';
    } else {
      const spaceIndex = trimmedName.indexOf(' ');
      if (spaceIndex === -1 || spaceIndex === trimmedName.length - 1) {
        newErrors.fullName = 'Enter both your first and last name.';
      }
    }

    // Email: valid, max 256
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Enter your work email address.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    } else if (email.trim().length > 256) {
      newErrors.email = 'Email must be 256 characters or fewer.';
    }

    // Password: 8 to 128 characters with message at each limit
    if (!password) {
      newErrors.password = 'Enter a password.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (password.length > 128) {
      newErrors.password = 'Password must be 128 characters or fewer.';
    }

    setErrors(newErrors);

    // Focus first invalid field
    if (newErrors.companyName) {
      companyNameRef.current?.focus();
      return false;
    }
    if (newErrors.fullName) {
      fullNameRef.current?.focus();
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

  // Form submission & state sequences
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrors({});
    if (!validateForm()) return;

    setIsSubmitting(true);
    setAssignPhase(null);
    setCubeOrigin(null);
    pendingAuthRef.current = null;
    skipSequenceRef.current = false;
    setState('scanning');

    // Split name
    const spaceIndex = fullName.trim().indexOf(' ');
    const firstName =
      spaceIndex === -1 ? fullName.trim() : fullName.trim().slice(0, spaceIndex);
    const lastName =
      spaceIndex === -1 ? '' : fullName.trim().slice(spaceIndex + 1).trim();

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const waitFrame = () =>
      new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      );

    const delayOrSkip = async (ms: number) => {
      const start = Date.now();
      while (Date.now() - start < ms) {
        if (skipSequenceRef.current) return true;
        await delay(40);
      }
      return skipSequenceRef.current;
    };

    const finishAssigned = async (
      apiPromise: Promise<Awaited<ReturnType<typeof apiRegister>>>,
    ) => {
      const authResponse = await apiPromise;
      storeAuthSession(authResponse);
      setGeneratedTenantId(authResponse.tenantId);
      setAssignPhase(null);
      setCubeOrigin(null);
      setState('completed');
    };

    try {
      const apiPromise = apiRegister({
        tenantName: companyName.trim(),
        email: email.trim(),
        password,
        firstName,
        lastName,
      }).then((res) => {
        pendingAuthRef.current = res;
        return res;
      });

      // Step 1: Scanning
      if (await delayOrSkip(isReducedMotion ? 200 : 800)) {
        await finishAssigned(apiPromise);
        return;
      }

      // Step 2: Pick vacant unit and begin assignment ceremony
      const colsNow = isMobile ? 4 : 5;
      const rowsNow = isMobile ? 5 : 6;
      const tw = colsNow * rowsNow;
      const vacant = VACANT_WINDOWS.filter((i) => i < tw);
      const pick =
        vacant[Math.floor(Math.random() * vacant.length)] ??
        Math.min(3, tw - 1);
      const unitCode = `UNIT ${Math.floor(Math.random() * 5 + 1)}${['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)]}`;

      setAssignedWindowIndex(pick);
      setAssignedUnit(unitCode);
      setState('assigning');

      if (isReducedMotion || skipSequenceRef.current) {
        await finishAssigned(apiPromise);
        return;
      }

      await waitFrame();
      const el = windowRefs.current.get(pick);
      const rect = el?.getBoundingClientRect();
      const origin = rect
        ? {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }
        : {
            left: window.innerWidth / 2 - 40,
            top: window.innerHeight / 2 - 40,
            width: 80,
            height: 64,
          };
      setCubeOrigin(origin);

      setAssignPhase('lift');
      if (await delayOrSkip(480)) {
        await finishAssigned(apiPromise);
        return;
      }

      setAssignPhase('center');
      if (await delayOrSkip(720)) {
        await finishAssigned(apiPromise);
        return;
      }

      setAssignPhase('name');
      const wordCount = companyName
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      if (await delayOrSkip(Math.max(900, wordCount * 120 + 520))) {
        await finishAssigned(apiPromise);
        return;
      }

      setAssignPhase('seal');
      if (await delayOrSkip(620)) {
        await finishAssigned(apiPromise);
        return;
      }

      await finishAssigned(apiPromise);
    } catch (err: any) {
      setAssignPhase(null);
      setCubeOrigin(null);
      setState('failure');
      const errorMsg =
        err?.status === 409
          ? 'That email is already registered.'
          : err?.status === 429
          ? 'Too many attempts. Please wait and try again.'
          : err?.message || 'Registration failed. Please check your information.';

      setTimeout(() => {
        setState('idle');
        setIsSubmitting(false);
        setErrors({ server: errorMsg });
      }, isReducedMotion ? 300 : 1000);
    }
  };

  // 6-second auto-enter countdown in completed state
  useEffect(() => {
    if (state !== 'completed' || !autoEnterActive) return;

    const totalMs = 6000;
    const intervalMs = 50;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalMs;
      const remaining = Math.max(0, 100 - (elapsed / totalMs) * 100);
      setCountdownPercent(remaining);

      if (elapsed >= totalMs) {
        clearInterval(interval);
        handleEnterNow();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [state, autoEnterActive]);

  // Copy tenant ID handler (cancels auto-enter)
  const handleCopy = () => {
    if (!generatedTenantId) return;
    navigator.clipboard.writeText(generatedTenantId);
    setCopied(true);
    setAutoEnterActive(false); // specification: cancelled if user starts copying
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterNow = () => {
    enterAuthenticatedShell();
    navigate('/dashboard');
    loadWorkspace();
  };

  // Show "SKIP" button after 1s during sequence
  useEffect(() => {
    let timer: any;
    if (state === 'scanning' || state === 'assigning') {
      timer = setTimeout(() => setShowSkip(true), 1000);
    } else {
      setShowSkip(false);
    }
    return () => clearTimeout(timer);
  }, [state]);

  const handleSkipAnimation = () => {
    skipSequenceRef.current = true;
  };

  // Tower grid definition: 5 columns x 6 rows = 30 windows (desktop)
  // 4 columns x 5 rows = 20 windows (mobile)
  const cols = isMobile ? 4 : 5;
  const rows = isMobile ? 5 : 6;
  const totalWindows = cols * rows;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#141414] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-sans"
    >
      {/* Top Bar */}
      <AuthTopBar />

      {/* BACKGROUND: VAULT TOWER ARCHITECTURAL FACADE */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          style={{
            transform: `translate3d(${mouseOffset.x * 14}px, ${mouseOffset.y * 14}px, 0)`,
            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
          }}
          className="relative w-full max-w-4xl h-[90vh] flex flex-col items-center justify-between p-6 opacity-75"
        >
          {/* Tower Facade Header */}
          <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-neutral-500" />
              <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-neutral-300">
                VAULT TOWER
              </span>
            </div>
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800 px-2 py-0.5 rounded bg-black/60">
              FACILITY 07
            </span>
          </div>

          {/* Cyan Scan Beam (active during scanning state) */}
          {state === 'scanning' && (
            <div className="absolute left-0 right-0 h-1 bg-[#22D3EE] shadow-[0_0_24px_#22D3EE] z-10 animate-scan-beam" />
          )}

          {/* Window Grid */}
          <div
            className="w-full grid gap-2.5 sm:gap-3.5 my-auto p-4 sm:p-8 rounded-xl bg-black/40 border border-neutral-900"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: totalWindows }).map((_, idx) => {
              const isVacant = VACANT_WINDOWS.includes(idx);
              const isSelected = idx === assignedWindowIndex;
              const cubeInFlight =
                state === 'assigning' &&
                assignPhase !== null &&
                assignPhase !== 'seal';

              let windowStyle = 'bg-neutral-900/60 border-neutral-800/80';
              if (!isVacant) {
                windowStyle =
                  idx % 2 === 0
                    ? 'bg-amber-950/20 border-amber-900/30'
                    : 'bg-neutral-800/40 border-neutral-700/40';
              }

              if (state === 'scanning') {
                windowStyle = 'bg-[#22D3EE]/20 border-[#22D3EE]/40';
              }

              // Ghost slot while the cube is flying
              if (isSelected && cubeInFlight) {
                windowStyle =
                  'bg-transparent border-dashed border-[#22D3EE]/45 opacity-70';
              }

              // Settling / assigned amber — hide under floating seal cube to avoid double
              if (
                isSelected &&
                (state === 'completed' ||
                  (state === 'assigning' && assignPhase === 'seal'))
              ) {
                windowStyle =
                  state === 'completed'
                    ? 'bg-[#FFB020] border-[#FFB020] shadow-[0_0_35px_#FFB020] scale-105'
                    : 'bg-transparent border-transparent';
              }

              return (
                <div
                  key={idx}
                  ref={(node) => {
                    if (node) windowRefs.current.set(idx, node);
                    else windowRefs.current.delete(idx);
                  }}
                  className={`relative h-12 sm:h-16 rounded border transition-all duration-300 flex items-center justify-center ${windowStyle}`}
                >
                  {!isVacant && state === 'idle' && (
                    <div className="w-2.5 h-4 bg-black/60 rounded-t-sm self-end mb-1 opacity-70" />
                  )}

                  {isSelected && state === 'completed' && (
                    <div className="absolute -top-7 px-2 py-0.5 rounded bg-[#141414] border border-[#FFB020] text-[#FFB020] font-mono text-[9px] uppercase tracking-wider whitespace-nowrap shadow-lg animate-bounce">
                      {companyName
                        ? `${companyName.slice(0, 14)} · ${assignedUnit}`
                        : assignedUnit}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Facade Foundation */}
          <div className="w-full flex items-center justify-between border-t border-neutral-800 pt-3 font-mono text-[10px] text-neutral-600">
            <span>SECTOR 04 · RECEPTIVE GRID</span>
            <span>MODULAR WORKSPACE FACILITY</span>
          </div>
        </div>
      </div>

      {/* Floating assignment cube: lift → center → name reveal → seal */}
      <AnimatePresence>
        {state === 'assigning' && cubeOrigin && assignPhase && (
          <motion.div
            key="assign-cube"
            className="fixed z-40 pointer-events-none flex flex-col items-center"
            style={{ position: 'fixed' }}
            initial={{
              left: cubeOrigin.left,
              top: cubeOrigin.top,
              width: cubeOrigin.width,
              height: cubeOrigin.height,
              opacity: 1,
            }}
            animate={
              assignPhase === 'lift'
                ? {
                    left: cubeOrigin.left,
                    top: cubeOrigin.top - 36,
                    width: cubeOrigin.width,
                    height: cubeOrigin.height,
                    opacity: 1,
                  }
                : assignPhase === 'seal'
                  ? {
                      left: cubeOrigin.left,
                      top: cubeOrigin.top,
                      width: cubeOrigin.width,
                      height: cubeOrigin.height,
                      opacity: 1,
                    }
                  : {
                      left:
                        typeof window !== 'undefined'
                          ? window.innerWidth / 2 - (isMobile ? 70 : 90)
                          : cubeOrigin.left,
                      top:
                        typeof window !== 'undefined'
                          ? window.innerHeight * 0.36 - (isMobile ? 70 : 90)
                          : cubeOrigin.top,
                      width: isMobile ? 140 : 180,
                      height: isMobile ? 140 : 180,
                      opacity: 1,
                    }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration:
                assignPhase === 'lift' ? 0.45 : assignPhase === 'seal' ? 0.55 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className={`w-full h-full rounded-lg border-2 flex items-center justify-center transition-colors duration-500 ${
                assignPhase === 'seal'
                  ? 'bg-[#FFB020] border-[#FFB020] shadow-[0_0_35px_#FFB020]'
                  : 'bg-[#22D3EE]/30 border-[#22D3EE] shadow-[0_0_40px_rgba(34,211,238,0.45)]'
              }`}
            >
              <Sparkles
                className={`transition-all duration-500 ${
                  assignPhase === 'seal'
                    ? 'w-4 h-4 text-[#141414]'
                    : assignPhase === 'lift'
                      ? 'w-4 h-4 text-[#22D3EE] opacity-70'
                      : 'w-8 h-8 text-[#22D3EE] opacity-100'
                }`}
              />
            </div>

            {(assignPhase === 'center' || assignPhase === 'name') && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-full mt-5 left-1/2 -translate-x-1/2 w-[min(90vw,320px)] text-center"
              >
                {assignPhase === 'name' ? (
                  <TimedWordReveal
                    text={companyName.trim() || 'Your company'}
                    active
                    className="font-sans font-black text-2xl sm:text-3xl tracking-[-0.03em] leading-tight"
                  />
                ) : (
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    Claiming unit…
                  </p>
                )}
                {assignPhase === 'name' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="mt-2 font-mono text-[11px] uppercase tracking-widest text-[#FFB020]"
                  >
                    {assignedUnit}
                  </motion.p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TELEMETRY OVERLAY FOR SCANNING & ASSIGNING */}
      {(state === 'scanning' || state === 'assigning') && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 font-mono text-xs sm:text-sm tracking-widest text-[#22D3EE] uppercase flex items-center gap-2.5 bg-black/90 px-5 py-2.5 rounded-full border border-[#22D3EE]/40 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-ping" />
          <span>
            {state === 'scanning'
              ? 'GRID SCAN ACTIVE'
              : assignPhase === 'lift'
                ? 'UNIT SELECTED'
                : assignPhase === 'center'
                  ? 'BRINGING UNIT FORWARD'
                  : assignPhase === 'name'
                    ? 'INSCRIBING WORKSPACE'
                    : assignPhase === 'seal'
                      ? `ASSIGNING ${assignedUnit}`
                      : `LOCKING UNIT... ${assignedUnit}`}
          </span>
          <span className="inline-block w-1.5 h-4 bg-[#22D3EE] animate-pulse" />
        </div>
      )}

      {/* SKIP ANIMATION BUTTON (after 1s) */}
      {showSkip && (state === 'scanning' || state === 'assigning') && (
        <button
          onClick={handleSkipAnimation}
          className="fixed bottom-4 right-4 z-40 px-3 py-1.5 rounded-full bg-black/80 hover:bg-neutral-800 border border-white/20 font-mono text-[11px] uppercase tracking-wider text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          aria-label="Skip animation sequence"
        >
          <SkipForward className="w-3 h-3 text-[#FFB020]" />
          <span>SKIP</span>
        </button>
      )}

      {/* FORM CARD (IDLE STATE) */}
      <div
        className={`relative z-20 w-full max-w-[440px] transition-all duration-500 ${
          state !== 'idle' && state !== 'failure'
            ? 'opacity-0 pointer-events-none scale-95 translate-y-4'
            : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <div className="rounded-[16px] bg-[#141414]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl">
          {/* Tag */}
          <SectionTag index="S.01" label="NEW WORKSPACE" theme="dark" />

          {/* Headline */}
          <h1 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-[-0.03em] leading-tight mt-1 mb-2">
            Claim your space.
          </h1>
          <p className="font-mono text-[11px] text-neutral-400 mb-6">
            A unit in the tower is assigned to your company at random.
          </p>

          {/* Server / Validation Error Banner */}
          {errors.server && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-5 p-3 rounded-lg bg-red-950/40 border border-[#F87171]/40 text-[#F87171] text-xs font-mono flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block tracking-wider uppercase text-[10px]">
                  REGISTRATION ERROR
                </span>
                <span className="font-sans text-neutral-300 mt-0.5 block">
                  {errors.server}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* COMPANY NAME */}
            <div>
              <label
                htmlFor="signup-company-name"
                className="block font-mono text-xs uppercase tracking-wider text-neutral-300 mb-1.5"
              >
                COMPANY NAME
              </label>
              <input
                id="signup-company-name"
                ref={companyNameRef}
                type="text"
                autoComplete="organization"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) {
                    setErrors((prev) => ({ ...prev, companyName: undefined }));
                  }
                }}
                placeholder="e.g. Apex Industrial Supplies"
                aria-invalid={!!errors.companyName}
                aria-describedby={
                  errors.companyName
                    ? 'company-name-error'
                    : 'workspace-address-preview'
                }
                className={`w-full h-11 px-3.5 rounded-lg bg-neutral-950/80 border text-white font-sans text-sm transition-all placeholder:text-neutral-600 focus:outline-none ${
                  errors.companyName
                    ? 'border-[#F87171] focus:ring-1 focus:ring-[#F87171]'
                    : 'border-white/10 focus:border-[#FFB020] focus:ring-1 focus:ring-[#FFB020]'
                }`}
              />
              {/* Read-only mono line under company name: address preview */}
              <div
                id="workspace-address-preview"
                className="font-mono text-[10.5px] text-neutral-400 mt-1 flex items-center justify-between truncate"
              >
                <span className="text-neutral-500 uppercase text-[9px] mr-1">
                  PREVIEW:
                </span>
                <span className="text-[#FFB020] truncate">
                  {workspaceAddressPreview}
                </span>
              </div>
              {errors.companyName && (
                <p
                  id="company-name-error"
                  role="alert"
                  className="font-mono text-[11px] text-[#F87171] mt-1"
                >
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* YOUR NAME (first and last, one field) */}
            <div>
              <label
                htmlFor="signup-full-name"
                className="block font-mono text-xs uppercase tracking-wider text-neutral-300 mb-1.5"
              >
                YOUR NAME
              </label>
              <input
                id="signup-full-name"
                ref={fullNameRef}
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                placeholder="e.g. Alex Mercer"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'full-name-error' : undefined}
                className={`w-full h-11 px-3.5 rounded-lg bg-neutral-950/80 border text-white font-sans text-sm transition-all placeholder:text-neutral-600 focus:outline-none ${
                  errors.fullName
                    ? 'border-[#F87171] focus:ring-1 focus:ring-[#F87171]'
                    : 'border-white/10 focus:border-[#FFB020] focus:ring-1 focus:ring-[#FFB020]'
                }`}
              />
              {errors.fullName && (
                <p
                  id="full-name-error"
                  role="alert"
                  className="font-mono text-[11px] text-[#F87171] mt-1"
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* WORK EMAIL */}
            <div>
              <label
                htmlFor="signup-email"
                className="block font-mono text-xs uppercase tracking-wider text-neutral-300 mb-1.5"
              >
                WORK EMAIL
              </label>
              <input
                id="signup-email"
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
                aria-describedby={errors.email ? 'signup-email-error' : undefined}
                className={`w-full h-11 px-3.5 rounded-lg bg-neutral-950/80 border text-white font-sans text-sm transition-all placeholder:text-neutral-600 focus:outline-none ${
                  errors.email
                    ? 'border-[#F87171] focus:ring-1 focus:ring-[#F87171]'
                    : 'border-white/10 focus:border-[#FFB020] focus:ring-1 focus:ring-[#FFB020]'
                }`}
              />
              {errors.email && (
                <p
                  id="signup-email-error"
                  role="alert"
                  className="font-mono text-[11px] text-[#F87171] mt-1"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD with strength bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signup-password"
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
              <input
                id="signup-password"
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="Min. 8 characters"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'signup-password-error' : undefined
                }
                className={`w-full h-11 px-3.5 rounded-lg bg-neutral-950/80 border text-white font-sans text-sm transition-all placeholder:text-neutral-600 focus:outline-none ${
                  errors.password
                    ? 'border-[#F87171] focus:ring-1 focus:ring-[#F87171]'
                    : 'border-white/10 focus:border-[#FFB020] focus:ring-1 focus:ring-[#FFB020]'
                }`}
              />

              {/* Thin strength bar */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-neutral-400">
                    <span>STRENGTH:</span>
                    <span className="font-semibold">{passwordStrength.label}</span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p
                  id="signup-password-error"
                  role="alert"
                  className="font-mono text-[11px] text-[#F87171] mt-1"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Primary Pill: CREATE WORKSPACE */}
            <div className="pt-2">
              <VaultPillButton
                type="submit"
                label={isSubmitting ? 'CLAIMING SPACE...' : 'CREATE WORKSPACE'}
                variant="light"
                className="w-full justify-between"
              />
            </div>
          </form>

          {/* Footer link to Login */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center font-mono text-xs text-neutral-400">
            <span>Already have a workspace? </span>
            <Link
              to="/login"
              className="text-white hover:text-[#FFB020] font-semibold transition-colors underline underline-offset-4 decoration-neutral-700 hover:decoration-[#FFB020]"
            >
              LOG IN
            </Link>
          </div>
        </div>
      </div>

      {/* COMPLETED CARD (POST-SIGNUP SUCCESS STATE) */}
      {state === 'completed' && (
        <div className="relative z-30 w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
          <div className="rounded-[16px] bg-[#141414]/90 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-[#34D399] font-mono text-xs uppercase tracking-wider font-semibold">
                <Check className="w-4 h-4" />
                <span>UNIT ALLOCATED · {assignedUnit}</span>
              </div>
              <span className="font-mono text-[10px] text-[#FFB020] uppercase border border-[#FFB020]/30 px-2 py-0.5 rounded bg-black/50">
                ACTIVE
              </span>
            </div>

            <div>
              <h2 className="font-sans font-black text-2xl text-white tracking-tight">
                Workspace Created
              </h2>
              <p className="font-sans text-xs text-neutral-400 mt-1">
                Your private workspace for <strong>{companyName}</strong> has been secured in the ledger.
              </p>
            </div>

            {/* Returned Tenant ID Box with COPY Button */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                YOUR WORKSPACE ID
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/90 border border-white/20">
                <code className="flex-1 font-mono text-xs text-[#FFB020] truncate select-all">
                  {generatedTenantId}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  aria-label="Copy workspace ID"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#34D399]" />
                      <span className="text-[#34D399]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-neutral-400" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-[10px] text-neutral-400 mt-1">
                Save this. You will need it to log in.
              </p>
            </div>

            {/* Pill "ENTER NOW" */}
            <div className="pt-2">
              <VaultPillButton
                label="ENTER NOW"
                variant="light"
                onClick={handleEnterNow}
                className="w-full justify-between"
              />
            </div>

            {/* Auto-enter thin countdown line */}
            {autoEnterActive && (
              <div className="space-y-1">
                <div className="h-0.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${countdownPercent}%` }}
                    className="h-full bg-[#FFB020] transition-all duration-75"
                  />
                </div>
                <div className="text-center font-mono text-[9px] text-neutral-400 tracking-wider">
                  AUTO-ENTERING IN {Math.ceil((countdownPercent / 100) * 6)}S · COPY ID TO PAUSE
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

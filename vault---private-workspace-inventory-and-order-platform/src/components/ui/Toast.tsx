import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cx, prefersReducedMotion } from '../../lib/cn';

export type ToastTone = 'success' | 'info' | 'warning' | 'danger';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toasts: ToastItem[];
  pushToast: (input: Omit<ToastItem, 'id'> & { id?: string }) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneBorder: Record<ToastTone, string> = {
  success: 'border-vault-success/40',
  info: 'border-vault-info/40',
  warning: 'border-vault-amber/40',
  danger: 'border-vault-danger/40',
};

const toneIcon: Record<ToastTone, string> = {
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
  danger: 'error',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pausedIds, setPausedIds] = useState<Set<string>>(new Set());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (input: Omit<ToastItem, 'id'> & { id?: string }) => {
      const id = input.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: ToastItem = {
        id,
        title: input.title,
        message: input.message,
        tone: input.tone,
      };
      setToasts((prev) => [item, ...prev].slice(0, 5));
      window.setTimeout(() => {
        setPausedIds((paused) => {
          if (paused.has(id)) return paused;
          dismissToast(id);
          return paused;
        });
      }, 4000);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({ toasts, pushToast, dismissToast }),
    [toasts, pushToast, dismissToast]
  );

  const reduced = prefersReducedMotion();

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex w-[min(100%-2rem,22rem)] flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout={!reduced}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setPausedIds((s) => new Set(s).add(toast.id))}
              onMouseLeave={() =>
                setPausedIds((s) => {
                  const next = new Set(s);
                  next.delete(toast.id);
                  return next;
                })
              }
              className={cx(
                'rounded-xl border bg-vault-surface px-4 py-3 shadow-lg',
                toneBorder[toast.tone]
              )}
              role="status"
            >
              <div className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-[18px] text-vault-secondary mt-0.5"
                  aria-hidden
                >
                  {toneIcon[toast.tone]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-vault-text">{toast.title}</p>
                  {toast.message ? (
                    <p className="mt-0.5 text-xs text-vault-secondary">{toast.message}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="text-vault-muted hover:text-vault-text vault-focus rounded"
                  aria-label="Dismiss notification"
                  onClick={() => dismissToast(toast.id)}
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

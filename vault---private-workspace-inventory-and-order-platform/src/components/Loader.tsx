import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';

interface LoaderProps {
  onComplete?: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [wipingUp, setWipingUp] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Hold briefly, then initiate wipe up
    const holdTimer = setTimeout(() => {
      setWipingUp(true);
    }, 850);

    const removeTimer = setTimeout(() => {
      setRemoved(true);
      if (onComplete) onComplete();
    }, 1550);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (removed) return null;

  return (
    <AnimatePresence>
      {!removed && (
        <motion.div
          initial={{ y: 0 }}
          animate={wipingUp ? { y: '-100%' } : { y: 0 }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414] select-none"
          role="status"
          aria-live="polite"
          aria-label="Loading VAULT platform"
        >
          {/* Centered white pill with VAULT wordmark and shield icon */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-[#141414] shadow-2xl border border-white/20">
            <div className="w-6 h-6 rounded bg-[#141414] text-white flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#FFB020]" />
            </div>
            <span className="font-mono text-xs sm:text-sm font-bold tracking-widest uppercase">
              VAULT
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

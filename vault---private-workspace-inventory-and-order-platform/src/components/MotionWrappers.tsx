import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';

const isReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Fade and rise 24px as it enters viewport
 */
export const FadeRise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  if (isReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered card grid item (80ms apart, rising 32px with fade)
 */
export const StaggerCard: React.FC<{
  children: React.ReactNode;
  index: number;
  className?: string;
}> = ({ children, index, className = '' }) => {
  if (isReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: (index % 6) * 0.08,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Parallax image wrapper with clip-path bottom reveal
 */
export const ParallaxImage: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax at 0.9x scroll speed (slight lag / translateY)
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  if (isReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: 'inset(15% 0% 0% 0%)', opacity: 0.7 }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`overflow-hidden ${className}`}
    >
      <motion.div style={{ y }}>{children}</motion.div>
    </motion.div>
  );
};

/**
 * Animated number counter that counts up once when it enters view
 */
export const CountUpNumber: React.FC<{
  value: string | number;
  className?: string;
}> = ({ value, className = '' }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState<string | number>(
    typeof value === 'number' ? 0 : value === 'LIVE' ? 'LIVE' : '0'
  );

  useEffect(() => {
    if (!isInView) return;

    if (isReducedMotion() || typeof value !== 'number' && isNaN(Number(value))) {
      setDisplayValue(value);
      return;
    }

    const target = Number(value);
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(target * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
};

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

interface ScrollWordRevealProps {
  text: string;
  className?: string;
  prefixElement?: React.ReactNode;
  theme?: 'light' | 'dark';
  as?: 'h2' | 'p' | 'blockquote' | 'div' | 'span';
}

interface WordProps {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
  theme: 'light' | 'dark';
}

const Word: React.FC<WordProps> = ({ children, range, progress, theme }) => {
  const isReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const color = useTransform(
    progress,
    range,
    theme === 'dark' ? ['#525252', '#FFFFFF'] : ['#B8BDB8', '#141414']
  );

  const opacity = useTransform(progress, range, [0.22, 1]);

  if (isReduced) {
    return (
      <span
        className={`inline-block mr-[0.28em] ${
          theme === 'dark' ? 'text-white' : 'text-[#141414]'
        }`}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      style={{ color, opacity }}
      className="inline-block mr-[0.28em] select-none"
    >
      {children}
    </motion.span>
  );
};

export const ScrollWordReveal: React.FC<ScrollWordRevealProps> = ({
  text,
  className = '',
  prefixElement,
  theme = 'light',
  as: Component = 'p',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.92', 'center 0.5'],
  });

  const words = text.split(' ').filter(Boolean);

  return (
    <Component ref={containerRef as any} className={className}>
      {prefixElement && (
        <span className="inline-block mr-2 sm:mr-3 align-baseline">{prefixElement}</span>
      )}
      {words.map((word, i) => {
        const start = i / words.length;
        const end = (i + 1) / words.length;
        return (
          <Word
            key={`${word}-${i}`}
            range={[start, end]}
            progress={scrollYProgress}
            theme={theme}
          >
            {word}
          </Word>
        );
      })}
    </Component>
  );
};

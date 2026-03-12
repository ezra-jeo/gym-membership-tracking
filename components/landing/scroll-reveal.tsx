'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { track } from '@vercel/analytics';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Used for analytics section_view event */
  section?: string;
}

export function ScrollReveal({ children, className = '', delay = 0, section }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('revealed');
          }, delay);
          if (section) track('section_view', { section });
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, section]);

  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}

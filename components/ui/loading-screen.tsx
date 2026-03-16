'use client';

import React from 'react';

// Full-page loading screen — used in layouts while auth resolves
export function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold"
        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
      >
        S
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full animate-bounce"
            style={{
              backgroundColor: 'var(--color-primary)',
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Page-level skeleton — renders N placeholder cards while data loads
export function PageSkeleton({ rows = 4, height = 80 }: { rows?: number; height?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl animate-pulse w-full"
          style={{ height, backgroundColor: 'var(--color-surface)' }}
        />
      ))}
    </div>
  );
}

// Inline spinner — used inside buttons and small areas
export function Spinner({ size = 16, color }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'var(--color-primary)'}
      strokeWidth={2.5}
      className="animate-spin"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

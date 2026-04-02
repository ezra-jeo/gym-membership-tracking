'use client';

import Image from 'next/image';
import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';

export default function QrLoginPage() {
  return (
    <div 
      className="min-h-[100dvh] flex flex-col px-6 py-8 animate-in fade-in duration-500"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/gym-select"
          className="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-150 hover:bg-black/5"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <ArrowLeft size={20} />
        </Link>
        <h1
          className="text-xl font-semibold"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text-primary)',
          }}
        >
          QR Login
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: 'var(--color-primary-glow)' }}
        >
          <QrCode size={48} style={{ color: 'var(--color-primary)' }} />
        </div>
        
        <h2
          className="text-2xl font-bold mb-3"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text-primary)',
          }}
        >
          Coming Soon
        </h2>
        
        <p
          className="text-base leading-relaxed max-w-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Scan your gym&apos;s QR code to instantly log in. This feature is currently in development.
        </p>
      </div>

      {/* Footer */}
      <div className="pt-8 pb-4">
        <Link
          href="/gym-select"
          className="block w-full px-6 py-4 rounded-xl font-semibold text-base text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-white)',
          }}
        >
          Back to Gym Selection
        </Link>
      </div>
    </div>
  );
}

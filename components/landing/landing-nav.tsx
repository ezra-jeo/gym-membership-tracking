'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
      style={{
        borderBottom: scrolled ? '1px solid var(--color-surface)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/landing" className="flex items-center gap-2">
          <div className="h-8 w-8 relative">
            <Image src="/stren-logo.png" alt="Stren" fill className="object-contain" />
          </div>
          <span
            className="text-xl font-bold transition-colors duration-300"
            style={{
              color: scrolled ? 'var(--color-primary)' : '#FFFFFF',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Stren
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium tracking-wide transition-colors duration-200 hover:opacity-80"
            style={{ color: scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.7)' }}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium tracking-wide transition-colors duration-200 hover:opacity-80"
            style={{ color: scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.7)' }}
          >
            How It Works
          </a>
          <Link
            href="/login"
            className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
            }}
          >
            Sign In
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          style={{ color: scrolled ? 'var(--color-text-primary)' : '#FFFFFF' }}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="border-t bg-white/98 backdrop-blur-md md:hidden"
          style={{ borderColor: 'var(--color-surface)' }}
        >
          <div className="flex flex-col gap-1 px-6 py-6">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              How It Works
            </a>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-3 rounded-full px-6 py-3 text-center text-sm font-semibold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

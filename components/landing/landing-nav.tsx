'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { track } from '@vercel/analytics';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'shadow-sm'
          : ''
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
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

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => track('nav_link_click', { target: link.label })}
              className="text-sm font-medium tracking-wide transition-colors duration-200 hover:opacity-80"
              style={{
                color: scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.75)',
              }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
            }}
          >
            Try the Demo
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
          className="border-t md:hidden"
          style={{
            borderColor: 'var(--color-surface)',
            backgroundColor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex flex-col gap-1 px-6 py-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-3 rounded-full px-6 py-3 text-center text-sm font-semibold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
              }}
            >
              Try the Demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

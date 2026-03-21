'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { track } from '@vercel/analytics';

const menuLinks = [
  { label: 'Getting Started', href: '#features' },
  { label: 'About Stren', href: '#about' },
  { label: 'Contact Us', href: '#contact' },
  { label: 'FAQ', href: '#' },
  { label: 'Product Roadmap', href: '#' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'shadow-sm' : ''
        }`}
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-surface)' : '1px solid transparent',
        }}
      >
        <div className="relative mx-auto flex max-w-7xl items-center justify-center px-6 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="absolute left-6 lg:left-8 flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 hover:bg-black/5"
            style={{ color: scrolled ? 'var(--color-text-primary)' : '#FFFFFF' }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="nav-menu-panel"
          >
            <span
              className="transition-transform duration-200"
              style={{ transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </span>
          </button>

          <Link href="/landing" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
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
        </div>
      </nav>

      {menuOpen && (
        <div
          id="nav-menu-panel"
          className="fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(6px)',
            }}
          />

          <div
            className="relative h-full w-[min(32rem,50vw)] border-r"
            style={{
              backgroundColor: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(16px)',
              borderColor: 'var(--color-surface)',
            }}
          >
            <div className="h-20" />

            <div className="flex h-[calc(100%-5rem)] flex-col justify-between px-8 py-8 lg:px-12">
              <div className="flex flex-col gap-1">
                {menuLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => {
                      track('nav_link_click', { target: link.label });
                      setMenuOpen(false);
                    }}
                    className="block rounded-lg px-4 py-4 text-lg font-medium transition-all duration-150 hover:bg-black/5"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {link.label}
                  </a>
                ))}

                <div className="my-4 border-t" style={{ borderColor: 'var(--color-surface)' }} />

                <div className="flex flex-col gap-3 px-4">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 24px rgba(212, 149, 106, 0.35)',
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-sm uppercase tracking-widest border-2 transition-all duration-200 hover:scale-105"
                    style={{
                      borderColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>

              <p className="text-xs tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                powered by Stren
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Shield, User } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useAuth } from '@/lib/auth-context';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { demoSignIn } = useAuth();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  const handleDemo = (role: 'admin' | 'member') => {
    track('demo_start', { role });
    demoSignIn(role);
    setMenuOpen(false);
    router.push(role === 'admin' ? '/admin' : '/member');
    router.refresh();
  };

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
          {/* Hamburger — absolute left */}
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

          {/* Center logo */}
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
        </div>
      </nav>

      {/* Full-screen menu panel */}
      {menuOpen && (
        <div
          id="nav-menu-panel"
          ref={menuRef}
          className="fixed inset-0 z-40 flex flex-col"
          style={{
            backgroundColor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Spacer for nav bar height */}
          <div className="h-20" />

          <div className="flex-1 flex flex-col justify-between px-8 lg:px-16 py-8">
            {/* Nav links */}
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

              {/* Divider */}
              <div
                className="my-4 border-t"
                style={{ borderColor: 'var(--color-surface)' }}
              />

              {/* Demo CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 px-4">
                <button
                  type="button"
                  onClick={() => handleDemo('admin')}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 24px rgba(212, 149, 106, 0.35)',
                  }}
                >
                  <Shield size={16} />
                  Try as Gym Owner
                </button>
                <button
                  type="button"
                  onClick={() => handleDemo('member')}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm uppercase tracking-widest border-2 transition-all duration-200 hover:scale-105 cursor-pointer"
                  style={{
                    borderColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <User size={16} />
                  Try as Member
                </button>
              </div>
            </div>

            {/* Bottom brand line */}
            <p
              className="text-xs tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}
            >
              powered by Stren
            </p>
          </div>
        </div>
      )}
    </>
  );
}

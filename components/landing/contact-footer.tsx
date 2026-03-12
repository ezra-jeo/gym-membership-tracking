'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { track } from '@vercel/analytics';

export function ContactFooter() {
  return (
    <footer
      id="contact"
      className="border-t pt-16 pb-10 px-6 lg:px-12"
      style={{
        backgroundColor: 'var(--color-charcoal)',
        borderColor: 'var(--color-graphite)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main grid */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Col 1: Brand */}
          <div>
            <Link href="/landing" className="inline-flex items-center gap-2 mb-4">
              <div className="h-8 w-8 relative">
                <Image
                  src="/stren-logo.png"
                  alt="Stren"
                  fill
                  className="object-contain"
                />
              </div>
              <span
                className="text-xl font-bold"
                style={{
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Stren
              </span>
            </Link>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--color-gray)' }}
            >
              Gym management, simplified. Built for independent gyms
              in the Philippines.
            </p>
          </div>

          {/* Col 2: Contact */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-[0.15em] mb-5"
              style={{ color: 'var(--color-light-gray)' }}
            >
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href="mailto:hello@stren.ph"
                onClick={() => track('contact_click', { type: 'email' })}
                className="flex items-center gap-3 text-sm transition-colors duration-200 hover:opacity-80"
                style={{ color: 'var(--color-gray)' }}
              >
                <Mail size={15} style={{ color: 'var(--color-primary)' }} />
                hello@stren.ph
              </a>
              <a
                href="tel:+639170000000"
                onClick={() => track('contact_click', { type: 'phone' })}
                className="flex items-center gap-3 text-sm transition-colors duration-200 hover:opacity-80"
                style={{ color: 'var(--color-gray)' }}
              >
                <Phone size={15} style={{ color: 'var(--color-primary)' }} />
                +63 917 000 0000
              </a>
              <div
                className="flex items-center gap-3 text-sm"
                style={{ color: 'var(--color-gray)' }}
              >
                <MapPin size={15} style={{ color: 'var(--color-primary)' }} />
                Metro Manila, Philippines
              </div>
            </div>
          </div>

          {/* Col 3: Links */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-[0.15em] mb-5"
              style={{ color: 'var(--color-light-gray)' }}
            >
              Links
            </h4>
            <div className="space-y-3">
              {[
                { label: 'About Stren', href: '#about' },
                { label: 'Features', href: '#features' },
                { label: 'Contact Us', href: '#contact' },
                { label: 'Sign In', href: '/login' },
              ].map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-sm transition-colors duration-200 hover:opacity-80"
                    style={{ color: 'var(--color-gray)' }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm transition-colors duration-200 hover:opacity-80"
                    style={{ color: 'var(--color-gray)' }}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t pt-6"
          style={{ borderColor: 'var(--color-graphite)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-smoke)' }}>
            © 2026 Stren. Built for independent gyms.
          </p>
        </div>
      </div>
    </footer>
  );
}

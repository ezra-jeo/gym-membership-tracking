'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Ken Burns */}
      <div className="absolute inset-0 animate-ken-burns">
        <Image
          src="/landing-gym.jpg"
          alt="Gym interior"
          fill
          className="object-cover photo-warm"
          priority
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(44,44,44,0.5) 0%, rgba(44,44,44,0.2) 40%, rgba(44,44,44,0.55) 100%)',
        }}
      />

      <div className="relative z-10 text-center text-white px-6 max-w-2xl">
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-[1.1] text-balance"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Your gym. Your members.{' '}
          <span className="block mt-2" style={{ color: 'var(--color-primary-light)' }}>
            Finally, one system for all of it.
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-10 text-gray-200 max-w-lg mx-auto leading-relaxed">
          Check-ins, payments, and attendance — tracked and organized from any device.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-wide transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              boxShadow: '0 4px 24px rgba(212, 149, 106, 0.35)',
            }}
          >
            See It In Action
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-wide border-2 border-white/30 transition-all duration-200 hover:border-white/60 hover:bg-white/10"
          >
            How It Works
          </a>
        </div>
      </div>

      <button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10"
        onClick={() =>
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
        }
        aria-label="Scroll down"
      >
        <ChevronDown size={32} className="text-white/70" />
      </button>
    </section>
  );
}

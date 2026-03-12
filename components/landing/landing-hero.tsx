'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { track } from '@vercel/analytics';

export function LandingHero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video background — poster fallback until real footage exists */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/landing-gym.jpg"
          className="absolute inset-0 w-full h-full object-cover photo-warm"
          style={{ willChange: 'transform' }}
        >
          {/* Drop MP4/WebM files into public/ when ready:
              <source src="/hero.webm" type="video/webm" />
              <source src="/hero.mp4" type="video/mp4" />
          */}
        </video>
        {/* Poster fallback with Ken Burns (visible until video sources are added) */}
        <Image
          src="/landing-gym.jpg"
          alt="Gym interior with warm lighting"
          fill
          className="object-cover photo-warm animate-ken-burns"
          priority
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--color-hero-overlay) 0%, rgba(26,26,26,0.15) 35%, rgba(26,26,26,0.15) 60%, var(--color-hero-overlay) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-3xl">
        <h1
          className="font-bold mb-4 leading-[1.05] tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--type-hero)',
          }}
        >
          Your gym. Your rules.
        </h1>
        <p
          className="mb-10 text-gray-200 max-w-xl mx-auto leading-relaxed"
          style={{ fontSize: 'var(--type-hero-sub)' }}
        >
          Reducing pen-and-paper. Built for gym owners, and members.
        </p>

        <Link
          href="/login"
          onClick={() => track('hero_cta_click')}
          className="inline-block px-10 py-4 rounded-full font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            boxShadow: '0 4px 24px rgba(212, 149, 106, 0.35)',
          }}
        >
          Try the Demo
        </Link>
      </div>

      {/* Scroll cue */}
      <button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10"
        onClick={() =>
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
        }
        aria-label="Scroll down"
      >
        <ChevronDown size={32} className="text-white/60" />
      </button>
    </section>
  );
}

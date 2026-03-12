'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, User } from 'lucide-react';
import { track } from '@vercel/analytics';

export function CTABand() {
  const router = useRouter();
  const { demoSignIn } = useAuth();

  const handleDemo = (role: 'admin' | 'member') => {
    track('demo_start', { role });
    demoSignIn(role);
    router.push(role === 'admin' ? '/admin' : '/member');
    router.refresh();
  };

  return (
    <section
      className="relative py-24 lg:py-32 px-6 lg:px-12 overflow-hidden"
      style={{ backgroundColor: 'var(--color-charcoal)' }}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, var(--color-primary-glow) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2
          className="font-bold mb-4 leading-tight"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--type-section)',
            color: 'var(--color-white)',
          }}
        >
          Get a better look on how Stren works
        </h2>

        <p
          className="mb-10"
          style={{
            color: 'var(--color-light-gray)',
            fontSize: 'var(--type-body)',
          }}
        >
          Free during pilot · No credit card required
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => handleDemo('admin')}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              boxShadow: '0 4px 24px rgba(212, 149, 106, 0.35)',
            }}
          >
            <Shield size={18} />
            Try as Gym Owner
          </button>
          <button
            type="button"
            onClick={() => handleDemo('member')}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-widest border-2 transition-all duration-200 hover:scale-105 hover:bg-white/10 cursor-pointer"
            style={{
              borderColor: 'rgba(255,255,255,0.25)',
              color: 'var(--color-white)',
            }}
          >
            <User size={18} />
            Try as Member
          </button>
        </div>
      </div>
    </section>
  );
}

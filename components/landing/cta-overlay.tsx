'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Shield, User } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useAuth } from '@/lib/auth-context';

export function CTAOverlay() {
  const router = useRouter();
  const { demoSignIn } = useAuth();

  const handleDemo = (role: 'admin' | 'member') => {
    track('demo_start', { role });
    demoSignIn(role);
    router.push(role === 'admin' ? '/admin' : '/member');
    router.refresh();
  };

  return (
    <section className="relative py-32 lg:py-40 px-6 lg:px-12 overflow-hidden">
      {/* Background image */}
      <Image
        src="/owner-success.jpg"
        alt="Gym owner"
        fill
        className="object-cover"
        loading="lazy"
        quality={75}
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(26,26,26,0.75) 0%, rgba(26,26,26,0.45) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2
          className="font-bold mb-4 leading-tight"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--type-section)',
            color: '#FFFFFF',
          }}
        >
          See what Stren can do for your gym.
        </h2>

        <p
          className="mb-10"
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'var(--type-body)',
          }}
        >
          Student-led. We make things happen.
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
              color: '#FFFFFF',
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

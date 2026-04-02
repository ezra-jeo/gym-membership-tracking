'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gym = searchParams.get('gym')?.trim();
    if (!gym) return;

    router.replace(`/gym/${encodeURIComponent(gym)}/login`);
  }, [router, searchParams]);

  return (
    <div
      className="min-h-dvh md:min-h-screen flex flex-col md:items-center md:justify-center px-6 py-8 md:p-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="w-full max-w-md relative z-10 md:rounded-3xl md:p-10">
        <div
          className="absolute inset-0 hidden md:block rounded-3xl"
          style={{
            backgroundColor: 'var(--color-white)',
            boxShadow: '0 4px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        />

        <div className="relative z-10">
        <div className="flex justify-center pt-14 md:pt-0 mb-10 md:mb-8">
          <Link href="/landing">
            <div
              className="h-20 w-20 rounded-full overflow-hidden border-2 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--color-surface)', backgroundColor: 'var(--color-white)' }}
            >
              <Image
                src="/stren-logo.png"
                alt="Stren Logo"
                width={80}
                height={80}
                className="h-full w-full object-contain p-1"
              />
            </div>
          </Link>
        </div>

        <div
          className="p-0 md:p-8 rounded-none md:rounded-2xl border-0 md:border shadow-none"
          style={{
            backgroundColor: 'transparent',
            borderColor: 'var(--color-surface)',
            borderWidth: '1px',
          }}
        >
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
              }}
            >
              Stren
            </h1>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Gym Engagement Platform
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Stren © 2026. All rights reserved.
        </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gym = searchParams.get('gym')?.trim();
    if (!gym) return;

    router.replace(`/gym/${encodeURIComponent(gym)}/login`);
  }, [router, searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-12">
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
          className="p-8 rounded-lg border shadow-md"
          style={{
            backgroundColor: 'var(--color-white)',
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
  );
}

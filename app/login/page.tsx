'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gym = searchParams.get('gym')?.trim();
    if (gym) {
      router.replace(`/gym/${encodeURIComponent(gym)}/login`);
      return;
    }

    router.replace('/gym-select');
  }, [router, searchParams]);

  return (
    <div className="min-h-dvh flex items-center justify-center px-6" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Redirecting to gym login...
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type GymPoweredByProps = {
  gymCode: string;
};

export function GymPoweredBy({ gymCode }: GymPoweredByProps) {
  const pathname = usePathname();

  if (pathname === `/gym/${gymCode}/login` || pathname === `/gym/${gymCode}/signup`) {
    return null;
  }

  return (
    <Link
      href="/landing"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 text-xs text-white/50 transition-colors hover:text-white/80"
    >
      Powered by Stren
    </Link>
  );
}
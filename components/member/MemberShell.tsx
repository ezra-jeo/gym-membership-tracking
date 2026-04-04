'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { MemberNotificationsPanel } from '@/components/member-notifications-panel';
import { Home, Activity, Trophy, User, Settings } from 'lucide-react';
import type { GymBranding } from '@/lib/gym-member';

const NAV_ITEMS = [
  { href: '/member', label: 'Home', icon: Home },
  { href: '/member/feed', label: 'Feed', icon: Activity },
  { href: '/member/leaderboard', label: 'Ranks', icon: Trophy },
  { href: '/member/settings', label: 'Settings', icon: Settings },
];

const AUTH_LOADING_TIMEOUT_MS = 12000;

interface MemberShellProps {
  children: React.ReactNode;
  gymBranding: GymBranding | null;
  hasServerUser: boolean;
}

export function MemberShell({ children, gymBranding, hasServerUser }: MemberShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const [authTimeoutExceeded, setAuthTimeoutExceeded] = React.useState(false);
  const gymCode = gymBranding?.code ?? null;
  const gymLoginHref = gymCode ? `/gym/${encodeURIComponent(gymCode)}/login` : '/login';

  useEffect(() => {
    if (!isLoading && !user && !hasServerUser) {
      router.replace(gymLoginHref);
    }
  }, [user, isLoading, hasServerUser, router, gymLoginHref]);

  useEffect(() => {
    if (!isLoading) {
      setAuthTimeoutExceeded(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAuthTimeoutExceeded(true);
    }, AUTH_LOADING_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!authTimeoutExceeded) return;
    router.replace(gymLoginHref);
  }, [authTimeoutExceeded, gymLoginHref, router]);

  if (isLoading || authTimeoutExceeded) return <LoadingScreen />;

  const gymName = gymBranding?.name ?? 'Stren';
  const gymLogoUrl = gymBranding?.logo_url ?? null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <header
        className="hidden md:flex items-center justify-between px-6 py-3 border-b"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        <Link
          href={gymCode ? `/gym/${encodeURIComponent(gymCode)}` : '/member'}
          className="flex items-center gap-2.5"
        >
          {gymLogoUrl ? (
            <div className="h-8 w-8 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-surface)' }}>
              <Image
                src={gymLogoUrl}
                alt={gymName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <Image src="/stren-logo.png" alt="Stren" width={32} height={32} className="object-contain" />
          )}
          <span
            className="font-bold text-lg"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
          >
            {gymName}
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-primary-glow)' : 'transparent',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
          <Link
            href="/member/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
            style={{
              color: pathname === '/member/profile' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: pathname === '/member/profile' ? 'var(--color-primary-glow)' : 'transparent',
            }}
          >
            <User size={18} />
            {profile?.name ?? 'Profile'}
          </Link>
          <MemberNotificationsPanel />
        </div>
      </header>

      <header
        className="md:hidden flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        <Link
          href={gymCode ? `/gym/${encodeURIComponent(gymCode)}` : '/member'}
          className="flex items-center gap-2"
        >
          {gymLogoUrl ? (
            <div className="h-7 w-7 rounded-md overflow-hidden border" style={{ borderColor: 'var(--color-surface)' }}>
              <Image
                src={gymLogoUrl}
                alt={gymName}
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <Image src="/stren-logo.png" alt="Stren" width={28} height={28} className="object-contain" />
          )}
          <span
            className="font-bold text-base"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
          >
            {gymName}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <MemberNotificationsPanel />
          <Link href="/member/profile">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}
            >
              {profile?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around py-2 z-50"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all"
              style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <Link
          href="/member/profile"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all"
          style={{ color: pathname === '/member/profile' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        >
          <User size={22} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

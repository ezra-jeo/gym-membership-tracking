'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Home,
  Activity,
  Trophy,
  Award,
  Target,
  User,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/member', label: 'Home', icon: Home },
  { href: '/member/feed', label: 'Feed', icon: Activity },
  { href: '/member/leaderboard', label: 'Ranks', icon: Trophy },
  { href: '/member/badges', label: 'Badges', icon: Award },
  { href: '/member/challenges', label: 'Goals', icon: Target },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 rounded-full mx-auto mb-4" style={{ backgroundColor: 'var(--color-primary-glow)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Top header — desktop only */}
      <header
        className="hidden md:flex items-center justify-between px-6 py-3 border-b"
        style={{
          backgroundColor: 'var(--color-white)',
          borderColor: 'var(--color-surface)',
        }}
      >
        <Link href="/member" className="flex items-center gap-2">
          <Image src="/stren-logo.png" alt="Stren" width={32} height={32} className="object-contain" />
          <span className="font-bold text-lg" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
            Stren
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-primary-glow)' : 'transparent',
                }}
              >
                <Icon size={18} />
                {item.label}
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
        </div>
      </header>

      {/* Main content — scrollable area */}
      <main className="flex-1 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom tab bar — mobile only */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around py-2 z-50"
        style={{
          backgroundColor: 'var(--color-white)',
          borderColor: 'var(--color-surface)',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 transition-all"
              style={{
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/member/profile"
          className="flex flex-col items-center gap-1 px-3 py-1 transition-all"
          style={{
            color: pathname === '/member/profile' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          }}
        >
          <User size={20} />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

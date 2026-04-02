'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { NotificationsPanel } from '@/components/notifications-panel';
import { LoadingScreen, Spinner } from '@/components/ui/loading-screen';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  Megaphone,
  UserPlus,
  Monitor,
  PackageOpen,
  Tag,
  Globe,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/admin',                 label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/members',         label: 'Members',       icon: Users },
  { href: '/admin/members/pending', label: 'Pending',       icon: UserPlus },
  { href: '/admin/payments',        label: 'Payments',      icon: CreditCard },
  { href: '/admin/plans',           label: 'Plans',         icon: PackageOpen },
  { href: '/admin/promos',          label: 'Promos',        icon: Tag },
  // { href: '/admin/announcements',   label: 'Announcements', icon: Megaphone },
  { href: '/admin/gym-profile',     label: 'Gym Page',      icon: Globe, ownerOnly: true },
  { href: '/admin/reports',         label: 'Reports',       icon: BarChart3 },
  { href: '/kiosk',                 label: 'Kiosk',         icon: Monitor },
];

const AUTH_LOADING_TIMEOUT_MS = 12000;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isLoading, isSigningOut, signOut, refreshProfile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [gymName, setGymName] = useState<string | null>(null);
  const [attemptedProfileRecovery, setAttemptedProfileRecovery] = useState(false);
  const [isRecoveringProfile, setIsRecoveringProfile] = useState(false);
  const [authTimeoutExceeded, setAuthTimeoutExceeded] = useState(false);

  useEffect(() => {
    if (isLoading || isRecoveringProfile) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!profile) {
      if (attemptedProfileRecovery) {
        router.replace('/login');
      }
      return;
    }

    if (!['owner', 'admin', 'staff'].includes(profile.role)) {
      router.replace('/member');
    }
  }, [attemptedProfileRecovery, isLoading, isRecoveringProfile, profile, router, user]);

  useEffect(() => {
    if (isLoading || !user || profile || attemptedProfileRecovery) return;

    let active = true;
    setAttemptedProfileRecovery(true);
    setIsRecoveringProfile(true);

    void refreshProfile().finally(() => {
      if (!active) return;
      setIsRecoveringProfile(false);
    });

    return () => {
      active = false;
    };
  }, [attemptedProfileRecovery, isLoading, profile, refreshProfile, user]);

  useEffect(() => {
    if (!isLoading && !isRecoveringProfile) {
      setAuthTimeoutExceeded(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAuthTimeoutExceeded(true);
    }, AUTH_LOADING_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading, isRecoveringProfile]);

  useEffect(() => {
    if (!authTimeoutExceeded) return;
    router.replace('/login');
  }, [authTimeoutExceeded, router]);

  // Fetch gym name once profile (and gymId) is available
  useEffect(() => {
    if (!profile?.gymId) return;
    supabase
      .from('gyms')
      .select('name')
      .eq('id', profile.gymId)
      .single()
      .then(({ data }) => {
        if (data?.name) setGymName(data.name);
      });
  }, [profile?.gymId, supabase]);

  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (item.ownerOnly) return profile?.role === 'owner';
        return true;
      }),
    [profile?.role]
  );

  // Always collapse mobile menu after route changes.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (isLoading || isRecoveringProfile || authTimeoutExceeded) return <LoadingScreen />;

  if (!user || !profile) return <LoadingScreen />;

  const handleLogout = async () => {
    if (isSigningOut) return;
    await signOut();
  };

  const displayName = gymName ?? 'Stren';
  const displayInitial = displayName.charAt(0).toUpperCase();

  // Reusable branding block used in both desktop sidebar and mobile header
  const GymBadge = () => (
    <div className="flex items-center gap-3">
      <div
        className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }}
      >
        {displayInitial}
      </div>
      <div className="min-w-0">
        <h1
          className="text-base font-bold leading-tight truncate"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
        >
          {displayName}
        </h1>
        <p className="text-xs capitalize" style={{ color: 'var(--color-gray)' }}>
          {profile.role} Panel
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-r md:flex md:flex-col md:p-6"
        style={{
          backgroundColor: 'var(--color-charcoal)',
          borderColor: 'var(--color-graphite)',
        }}
      >
        <div className="mb-8">
          <GymBadge />
        </div>

        <nav className="flex-1 space-y-1">
          {visibleNavItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                prefetch
                className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer mb-1"
                style={{
                  backgroundColor: isActive ? 'rgba(212, 149, 106, 0.12)' : 'transparent',
                  color: isActive ? 'var(--color-primary-light)' : 'var(--color-gray)',
                }}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className="space-y-4 pt-4 border-t"
          style={{ borderColor: 'var(--color-graphite)' }}
        >
          <div className="px-2 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-light-gray)' }}>
                {profile.email}
              </p>
              <p className="text-xs capitalize" style={{ color: 'var(--color-gray)' }}>
                {profile.role}
              </p>
            </div>
            <NotificationsPanel />
          </div>
          <button
            onClick={handleLogout}
            disabled={isSigningOut}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              color: 'var(--color-danger)',
              backgroundColor: 'rgba(224, 92, 92, 0.1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(224, 92, 92, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(224, 92, 92, 0.1)'; }}
          >
            {isSigningOut ? <Spinner size={18} color="var(--color-danger)" /> : <LogOut size={20} />}
            {isSigningOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64">

        {/* Mobile header */}
        <div
          className="md:hidden sticky top-0 z-40 border-b p-4 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-charcoal)',
            borderColor: 'var(--color-graphite)',
          }}
        >
          <GymBadge />
          <div className="flex items-center gap-1">
            <NotificationsPanel />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              style={{ color: 'var(--color-gray)' }}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div
            className="md:hidden border-b p-4 space-y-2"
            style={{
              backgroundColor: 'var(--color-charcoal)',
              borderColor: 'var(--color-graphite)',
            }}
          >
            {visibleNavItems.map(({ label, href, icon: Icon }) => (
              <Button
                key={href}
                variant="ghost"
                className="w-full justify-start gap-3"
                style={{ color: 'var(--color-gray)' }}
                asChild
              >
                <Link href={href}>
                  <Icon size={20} />
                  {label}
                </Link>
              </Button>
            ))}
            <Button
              onClick={handleLogout}
              variant="destructive"
              disabled={isSigningOut}
              className="w-full justify-start gap-3 mt-4"
            >
              {isSigningOut ? <Spinner size={16} color="currentColor" /> : <LogOut size={20} />}
              {isSigningOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        )}

        {/* Page content */}
        <div
          className="p-4 md:p-8"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
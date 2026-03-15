'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  Target,
  Megaphone,
  UserPlus,
  Monitor,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin',                 label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/members',         label: 'Members',       icon: Users },
  { href: '/admin/members/pending', label: 'Pending',       icon: UserPlus },
  { href: '/admin/payments',        label: 'Payments',      icon: CreditCard },
  { href: '/admin/challenges',      label: 'Challenges',    icon: Target },
  { href: '/admin/announcements',   label: 'Announcements', icon: Megaphone },
  { href: '/admin/reports',         label: 'Reports',       icon: BarChart3 },
  { href: '/kiosk',                 label: 'Kiosk',         icon: Monitor },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isLoading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [gymName, setGymName] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/login'); return; }
    if (profile && !['owner', 'admin', 'staff'].includes(profile.role)) {
      router.push('/member');
    }
  }, [user, profile, isLoading, router]);

  // Fetch gym name once profile (and gymId) is available
  useEffect(() => {
    if (!profile?.gymId) return;
    const supabase = createClient();
    supabase
      .from('gyms')
      .select('name')
      .eq('id', profile.gymId)
      .single()
      .then(({ data }) => {
        if (data?.name) setGymName(data.name);
      });
  }, [profile?.gymId]);

  if (isLoading || !user || !profile) return null;

  const handleLogout = async () => {
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
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-md transition-all cursor-pointer mb-1"
                  style={{
                    backgroundColor: isActive ? 'rgba(212, 149, 106, 0.12)' : 'transparent',
                    color: isActive ? 'var(--color-primary-light)' : 'var(--color-gray)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 149, 106, 0.08)';
                      e.currentTarget.style.color = 'var(--color-primary-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-gray)';
                    }
                  }}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div
          className="space-y-4 pt-4 border-t"
          style={{ borderColor: 'var(--color-graphite)' }}
        >
          <div className="px-2">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-light-gray)' }}>
              {profile.email}
            </p>
            <p className="text-xs capitalize" style={{ color: 'var(--color-gray)' }}>
              {profile.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all"
            style={{
              color: 'var(--color-danger)',
              backgroundColor: 'rgba(224, 92, 92, 0.1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(224, 92, 92, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(224, 92, 92, 0.1)'; }}
          >
            <LogOut size={20} />
            Logout
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            style={{ color: 'var(--color-gray)' }}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
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
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  style={{ color: 'var(--color-gray)' }}
                >
                  <Icon size={20} />
                  {label}
                </Button>
              </Link>
            ))}
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full justify-start gap-3 mt-4"
            >
              <LogOut size={20} />
              Logout
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
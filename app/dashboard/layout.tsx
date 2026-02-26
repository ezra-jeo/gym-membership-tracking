'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  CreditCard,
  UserCog,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const session = localStorage.getItem('session');
    if (!session) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('session');
    router.push('/');
  };

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Members', href: '/dashboard/members', icon: Users },
    { label: 'Check-In', href: '/dashboard/checkin', icon: QrCode },
    { label: 'Classes', href: '/dashboard/classes', icon: Calendar },
    { label: 'Plans', href: '/dashboard/plans', icon: CreditCard },
    { label: 'Staff', href: '/dashboard/staff', icon: UserCog },
    { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

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
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 relative">
            <Image
              src="/stren-logo.png"
              alt="Stren"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>Stren</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-md transition-all cursor-pointer border-l-3 mb-1"
                  style={{
                    color: 'var(--color-gray)',
                    borderColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 149, 106, 0.08)';
                    e.currentTarget.style.color = 'var(--color-primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-gray)';
                  }}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--color-graphite)' }}>
          <div className="px-2">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-light-gray)' }}>
              {user.email}
            </p>
            <p className="text-xs capitalize" style={{ color: 'var(--color-gray)' }}>
              {user.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all"
            style={{
              color: 'var(--color-danger)',
              backgroundColor: 'rgba(224, 92, 92, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(224, 92, 92, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(224, 92, 92, 0.1)';
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64">
        {/* Mobile Header */}
        <div 
          className="md:hidden sticky top-0 z-40 border-b p-4 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-white)',
            borderColor: 'var(--color-surface)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 relative">
              <Image
                src="/stren-logo.png"
                alt="Stren"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-lg font-bold">Stren</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div 
            className="md:hidden border-b p-4 space-y-2"
            style={{
              backgroundColor: 'var(--color-white)',
              borderColor: 'var(--color-surface)',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                  >
                    <Icon size={20} />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
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

        {/* Page Content */}
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

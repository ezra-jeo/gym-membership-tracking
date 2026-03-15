'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { Shield, User } from 'lucide-react';

function getRoleHome(role: string): string {
  switch (role) {
    case 'owner':
    case 'admin':
    case 'staff':
      return '/admin';
    case 'member':
    default:
      return '/member';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter email and password');
      setIsLoading(false);
      return;
    }

    const { error: authError, user } = await signIn(email, password);

    if (authError) {
      setError(authError);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
      return;
    }

    // Fetch profile directly using the user id from signIn — no extra getUser() call
    const supabase = createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.status === 'pending') {
      setError('Your account is awaiting gym approval.');
      await signOut();
      setIsLoading(false);
      return;
    }
    if (profile?.status === 'rejected') {
      setError('Your membership request was not approved. Contact the gym for details.');
      await signOut();
      setIsLoading(false);
      return;
    }

    router.push(getRoleHome(profile?.role ?? 'member'));
    router.refresh();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Link href="/landing">
            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src="/stren-logo.png"
                alt="Stren Logo"
                width={80}
                height={80}
                className="object-contain"
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
            <p
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Gym Engagement Platform
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderColor: 'var(--color-light-gray)',
                  borderWidth: '1.5px',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 149, 106, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-light-gray)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderColor: 'var(--color-light-gray)',
                  borderWidth: '1.5px',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 149, 106, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-light-gray)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {error && (
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-danger)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold uppercase tracking-widest transition-all transform hover:scale-105 active:scale-100"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                color: 'var(--color-white)',
                boxShadow: '0 4px 14px rgba(212, 149, 106, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(212, 149, 106, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(212, 149, 106, 0.4)';
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold transition-colors"
                style={{ color: 'var(--color-primary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Stren © 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}

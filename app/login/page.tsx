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
  const { signIn, demoSignIn } = useAuth();
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

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError);
      setIsLoading(false);
      return;
    }

    // Fetch profile to determine where to send the user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

      if (profile?.status === 'pending') {
        setError('Your account is awaiting gym approval.');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }
      if (profile?.status === 'rejected') {
        setError('Your membership request was not approved. Contact the gym for details.');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // ✅ Fixed: owners/admins/staff go to /admin, members go to /member
      router.push(getRoleHome(profile?.role ?? 'member'));
      router.refresh();
      return;
    }

    router.refresh();
    setIsLoading(false);
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
            <div className="h-20 w-20 relative cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src="/stren-logo.png"
                alt="Stren Logo"
                fill
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
              Gym Management, Simplified
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

          {/* Preview access — visible in all environments for pitch demos */}
          <div className="mt-6">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--color-light-gray)' }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2" style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-text-muted)' }}>
                  PREVIEW WITH SAMPLE DATA
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  demoSignIn('admin');
                  router.push('/admin');
                  router.refresh();
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                style={{
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'var(--color-primary-glow)',
                }}
              >
                <Shield size={16} />
                Preview as Gym Owner
              </button>
              <button
                type="button"
                onClick={() => {
                  demoSignIn('member');
                  router.push('/member');
                  router.refresh();
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-lg border text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  borderColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <User size={16} />
                Preview as Member
              </button>
            </div>
          </div>

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
          Powered by Stren · Built for independent gyms
        </p>
      </div>
    </div>
  );
}

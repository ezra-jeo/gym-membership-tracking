'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import type { z } from 'zod';

const PROFILE_RETRY_ATTEMPTS = 3;
const PROFILE_RETRY_DELAY_MS = 180;

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

interface LoginFormProps {
  gymCode?: string;
}

type LoginFormData = z.infer<typeof loginSchema>;

const LOGIN_ORIGIN_STORAGE_KEY = 'stren.auth.loginOriginPath';

export function LoginForm({ gymCode }: LoginFormProps) {
  const router = useRouter();
  const { signIn, signOut } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const resolveGymIdByCode = async (code: string): Promise<string | null> => {
    const { data, error: gymError } = await supabase
      .from('gyms')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (gymError) return null;
    return data?.id ?? null;
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const getProfileWithRetry = async (userId: string) => {
    for (let attempt = 0; attempt < PROFILE_RETRY_ATTEMPTS; attempt += 1) {
      const { data } = await supabase
        .from('profiles')
        .select('role, status, gym_id')
        .eq('id', userId)
        .maybeSingle();

      if (data) return data;
      if (attempt < PROFILE_RETRY_ATTEMPTS - 1) {
        await delay(PROFILE_RETRY_DELAY_MS * (attempt + 1));
      }
    }

    return null;
  };

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);
    try {
      const { email, password } = data;

      // Keep gym login visible, but prevent active management sessions from switching accounts here.
      if (gymCode) {
        const { data: existingSession } = await supabase.auth.getUser();
        if (existingSession.user && existingSession.user.email && existingSession.user.email !== email) {
          const existingProfile = await getProfileWithRetry(existingSession.user.id);
          if (existingProfile?.role && existingProfile.role !== 'member') {
            setError('You are already signed in as a gym management account. Sign out first before signing in as a member.');
            return;
          }
        }
      }

      const { error: authError, user, profile } = await signIn(email, password);

      if (authError) {
        setError(authError);
        return;
      }

      if (!user) {
        setError('Login failed. Please try again.');
        return;
      }

      if (profile?.status === 'pending') {
        setError('Your account is awaiting gym approval.');
        await signOut();
        return;
      }

      if (profile?.status === 'rejected') {
        setError('Your membership request was not approved. Contact the gym for details.');
        await signOut();
        return;
      }

      if (gymCode && profile?.role !== 'member') {
        setError('Gym management accounts must sign in from the Stren login page.');
        router.replace('/admin');
        return;
      }

      if (gymCode) {
        const targetGymId = await resolveGymIdByCode(gymCode);
        if (!targetGymId || profile?.gymId !== targetGymId) {
          setError('This account is not registered to this gym');
          await signOut();
          return;
        }
      }

      if (typeof window !== 'undefined') {
        const originPath = gymCode
          ? `/gym/${encodeURIComponent(gymCode)}/login`
          : '/login';

        try {
          window.localStorage.setItem(LOGIN_ORIGIN_STORAGE_KEY, originPath);
        } catch {
          // Storage can be unavailable in private/locked-down browser contexts.
        }
      }

      router.push(getRoleHome(profile?.role ?? 'admin'));
    } catch {
      setError('Login failed unexpectedly. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-2xl border transition-all outline-none"
            style={{
              backgroundColor: 'var(--color-white)',
              borderColor: 'var(--color-surface)',
              borderWidth: '1.5px',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 4px var(--color-primary-glow)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-surface)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {errors.email && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
              {errors.email.message}
            </p>
          )}
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
            {...register('password')}
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-2xl border transition-all outline-none"
            style={{
              backgroundColor: 'var(--color-white)',
              borderColor: 'var(--color-surface)',
              borderWidth: '1.5px',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 4px var(--color-primary-glow)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-surface)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {errors.password && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl font-semibold uppercase tracking-widest transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            color: 'var(--color-white)',
            boxShadow: '0 8px 20px var(--color-primary-glow)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 24px var(--color-primary-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 20px var(--color-primary-glow)';
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href={gymCode ? `/gym/${encodeURIComponent(gymCode)}/signup` : '/signup'}
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
    </>
  );
}

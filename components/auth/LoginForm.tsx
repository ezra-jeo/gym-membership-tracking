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

  const resolveGymCodeById = async (gymId: string): Promise<string | null> => {
    const { data, error: gymError } = await supabase
      .from('gyms')
      .select('code')
      .eq('id', gymId)
      .maybeSingle();

    if (gymError) return null;
    return data?.code ?? null;
  };

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);
    try {
      const { email, password } = data;
      const { error: authError, user } = await signIn(email, password);

      if (authError) {
        setError(authError);
        return;
      }

      if (!user) {
        setError('Login failed. Please try again.');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status, gym_id')
        .eq('id', user.id)
        .maybeSingle();

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

      if (!gymCode && profile?.role === 'member') {
        const memberGymCode = profile.gym_id
          ? await resolveGymCodeById(profile.gym_id)
          : null;

        await supabase.auth.signOut({ scope: 'local' });

        const fallbackHref = memberGymCode
          ? `/gym/${encodeURIComponent(memberGymCode)}/login`
          : '/login';

        router.replace(fallbackHref);
        router.refresh();
        return;
      }

      if (gymCode) {
        const targetGymId = await resolveGymIdByCode(gymCode);
        if (!targetGymId || profile?.gym_id !== targetGymId) {
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

      router.push(getRoleHome(profile?.role ?? 'member'));
      router.refresh();
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

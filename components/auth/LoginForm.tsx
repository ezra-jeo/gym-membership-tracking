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
import { isValidLoginOrigin } from '@/lib/login-origin'

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
  initialOriginPath?: string;
}

type LoginFormData = z.infer<typeof loginSchema>;

const LOGIN_ORIGIN_STORAGE_KEY = 'stren.auth.loginOriginPath';

export function LoginForm({ gymCode, initialOriginPath }: LoginFormProps) {
  const router = useRouter();
  const { signIn, signOut } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
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

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const { email, password } = data;

      const { error: authError, user, profile } = await signIn(email, password);

      if (authError) {
        setValue('password', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false });
        setError(authError);
        return;
      }

      if (!user) {
        setError('Login failed. Please try again.');
        return;
      }

      if (profile?.status === 'rejected') {
        setError('Your membership request was not approved. Contact the gym for details.');
        await signOut();
        return;
      }

      if (gymCode) {
        const targetGymId = await resolveGymIdByCode(gymCode);
        if (!targetGymId) {
          setError('Unable to verify gym. Please try again.');
          await signOut();
          return;
        }

        if (profile?.gymId !== targetGymId) {
          setError('This account is not part of this gym.');
          await signOut();
          return;
        }
      }

      if (typeof window !== 'undefined') {
        const computed = initialOriginPath
          ? initialOriginPath
          : gymCode
            ? `/gym/${encodeURIComponent(gymCode)}/login`
            : '/login'

        // Always persist a normalized (decoded) origin to avoid encoded '?' markers.
        let originPath = computed
        try {
          const decoded = decodeURIComponent(computed)
          originPath = decoded
        } catch {
          originPath = computed
        }

        originPath = isValidLoginOrigin(originPath) ? originPath : (gymCode ? `/gym/${encodeURIComponent(gymCode)}/login` : '/login')

        try {
          window.localStorage.removeItem(LOGIN_ORIGIN_STORAGE_KEY);
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

  const handleForgotPassword = async () => {
    const email = getValues('email')?.trim();
    setError('');
    setMessage('');

    if (!email) {
      setError('Enter your email first, then tap Forgot password.');
      return;
    }

    setIsSendingReset(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (resetError) {
      setError(resetError.message);
      setIsSendingReset(false);
      return;
    }

    setMessage('Password reset link sent. Check your email inbox.');
    setIsSendingReset(false);
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

        {message && (
          <p className="text-sm font-medium" style={{ color: '#16A34A' }}>
            {message}
          </p>
        )}

        <div className="-mt-1 text-right">
          <button
            type="button"
            onClick={() => void handleForgotPassword()}
            disabled={isLoading || isSendingReset}
            className="text-xs font-medium underline"
            style={{ color: 'var(--color-primary)' }}
          >
            {isSendingReset ? 'Sending reset link...' : 'Forgot password?'}
          </button>
        </div>

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
            href={gymCode ? `/gym/${encodeURIComponent(gymCode)}/signup?from=login` : '/signup'}
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

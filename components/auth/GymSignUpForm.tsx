'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberSignUpSchema } from '@/lib/validations';
import { createClient } from '@/lib/supabase';
import { CheckCircle2 } from 'lucide-react';
import type { z } from 'zod';

type FormData = z.infer<typeof memberSignUpSchema>;

interface GymSignUpFormProps {
  gymCode: string;
  gymId: string;
  gymName: string;
}

const inputStyle = {
  backgroundColor: 'var(--color-white)',
  borderColor: 'var(--color-light-gray)',
  borderWidth: '1.5px' as const,
  color: 'var(--color-text-primary)',
};

export function GymSignUpForm({ gymCode, gymId, gymName }: GymSignUpFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(memberSignUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name, role: 'member' } },
    });
    if (authError) {
      setServerError(authError.message);
      return;
    }
    if (!authData.user) {
      setServerError('Sign-up failed. Please try again.');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (signInError) {
      setServerError(`Account created but could not sign in: ${signInError.message}`);
      return;
    }

    const qrCode = `stren://checkin/${gymId}/${authData.user.id}`;
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: 'member' as const,
        status: 'pending' as const,
        gym_id: gymId,
        qr_code: qrCode,
      },
      { onConflict: 'id' },
    );
    if (profileError) {
      setServerError(profileError.message);
      return;
    }

    await supabase.auth.signOut();
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Account Created!
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Your account is awaiting approval from <strong>{gymName}</strong>. You can log in once they approve your membership.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-gym-code={gymCode}>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
          Full Name
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="Juan Dela Cruz"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-glow)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-light-gray)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {errors.name && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-glow)';
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

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          placeholder="********"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-glow)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-light-gray)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Must be at least 6 characters
        </p>
        {errors.password && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-lg font-semibold uppercase tracking-widest transition-all hover:scale-105 active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          color: 'var(--color-white)',
          boxShadow: '0 4px 14px var(--color-primary-glow)',
        }}
      >
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}

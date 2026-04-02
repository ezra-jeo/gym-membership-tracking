'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { generateGymCode } from '@/lib/crypto';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminSignUpSchema } from '@/lib/validations';
import type { z } from 'zod';

type AdminSignUpFormData = z.infer<typeof adminSignUpSchema>;

export default function AdminSignUpPage() {
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [gymCode, setGymCode] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminSignUpFormData>({
    resolver: zodResolver(adminSignUpSchema),
    defaultValues: {
      gymName: '',
      gymAddress: '',
      gymPhone: '',
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AdminSignUpFormData) => {
    setError('');
    setIsLoading(true);

    const { gymName, gymAddress, gymPhone, name, email, password } = data;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'owner' } },
    });
    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }
    if (!authData.user) {
      setError('Sign-up failed');
      setIsLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(`Account created but could not sign in: ${signInError.message}`);
      setIsLoading(false);
      return;
    }

    const code = generateGymCode(gymName);
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_gym_and_owner', {
      p_user_id: authData.user.id,
      p_email: email,
      p_name: name,
      p_gym_name: gymName,
      p_gym_code: code,
      p_gym_address: gymAddress || undefined,
      p_gym_phone: gymPhone || undefined,
    });

    if (rpcError) {
      setError(rpcError.message);
      setIsLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setGymCode((rpcData as { gym_code: string }).gym_code);
    setIsLoading(false);
    setDone(true);
  };

  const inputStyle = {
    backgroundColor: 'var(--color-white)',
    borderColor: 'var(--color-light-gray)',
    borderWidth: '1.5px' as const,
    color: 'var(--color-text-primary)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-12">
          <Link href="/landing">
            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <Image src="/stren-logo.png" alt="Stren Logo" width={80} height={80} className="object-contain" />
            </div>
          </Link>
        </div>

        <div className="p-8 rounded-lg border shadow-md" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)', borderWidth: '1px' }}>
          <Link href="/signup" className="inline-flex items-center gap-1 mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
                Gym Registered!
              </h2>
              <p className="text-base mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Your gym code is:
              </p>
              <p className="text-2xl font-bold mb-6 tracking-widest" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                {gymCode}
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Share this code with your members so they can find your gym when signing up.
              </p>
              <Link href="/login" className="inline-block py-3 px-8 rounded-lg font-semibold" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: 'var(--color-white)' }}>
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                Register Your Gym
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Set up your gym and owner account
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-primary)' }}>Gym Details</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Gym Name *</label>
                      <input {...register('gymName')} type="text" placeholder="Iron Paradise" disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                      {errors.gymName && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.gymName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Address</label>
                      <input {...register('gymAddress')} type="text" placeholder="123 Main St" disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                      {errors.gymAddress && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.gymAddress.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Phone</label>
                      <input {...register('gymPhone')} type="text" placeholder="09XX XXX XXXX" disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                      {errors.gymPhone && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.gymPhone.message}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-primary)' }}>Your Account</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Your Name *</label>
                      <input {...register('name')} type="text" placeholder="Juan Dela Cruz" disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                      {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Email *</label>
                      <input {...register('email')} type="email" placeholder="you@example.com" disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                      {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Password *</label>
                      <input {...register('password')} type="password" placeholder="••••••••" disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                      {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.password.message}</p>}
                    </div>
                  </div>
                </div>

                {error && <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>{error}</p>}

                <button type="submit" disabled={isLoading} className="w-full py-3 rounded-lg font-semibold uppercase tracking-widest transition-all hover:scale-105 active:scale-100" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', color: 'var(--color-white)', boxShadow: '0 4px 14px rgba(212,149,106,0.4)' }}>
                  {isLoading ? 'Creating...' : 'Register Gym'}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>Stren © 2026. All rights reserved.</p>
      </div>
    </div>
  );
}

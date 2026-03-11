'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase';

function generateCode(name: string) {
  const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

export default function AdminSignUpPage() {
  const supabase = createClient();

  const [gymName, setGymName] = useState('');
  const [gymAddress, setGymAddress] = useState('');
  const [gymPhone, setGymPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [gymCode, setGymCode] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!gymName || !name || !email || !password) { setError('Please fill in all required fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setIsLoading(true);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'owner' } },
    });
    if (authError) { setError(authError.message); setIsLoading(false); return; }
    if (!authData.user) { setError('Sign-up failed'); setIsLoading(false); return; }

    // 2. Sign in immediately to get an authenticated session
    //    Without this, subsequent DB writes fail with "No API key" because
    //    signUp does not automatically establish a session on the client.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError('Account created but could not sign in: ' + signInError.message); setIsLoading(false); return; }

    // 3. Create gym (now authenticated)
    const code = generateCode(gymName);
    const { data: gymData, error: gymError } = await supabase
      .from('gyms')
      .insert({ name: gymName, code, address: gymAddress || null, phone: gymPhone || null })
      .select('id')
      .single();

    if (gymError || !gymData) {
      setError(gymError?.message ?? 'Failed to create gym');
      setIsLoading(false);
      return;
    }

    // 4. Update profile with gym_id, role, and QR code
    //    The handle_new_user trigger already created the profile row —
    //    we just need to patch the gym-specific fields.
    const qrCode = `stren://checkin/${gymData.id}/${authData.user.id}`;
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name, role: 'owner', status: 'active', gym_id: gymData.id, qr_code: qrCode })
      .eq('id', authData.user.id);

    if (profileError) { setError(profileError.message); setIsLoading(false); return; }

    // 5. Sign out — let the user log in fresh so auth context loads cleanly
    await supabase.auth.signOut();

    setGymCode(code);
    setIsLoading(false);
    setDone(true);
  }

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
            <div className="h-20 w-20 relative cursor-pointer hover:opacity-80 transition-opacity">
              <Image src="/stren-logo.png" alt="Stren Logo" fill className="object-contain" />
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-primary)' }}>Gym Details</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Gym Name *</label>
                      <input type="text" placeholder="Iron Paradise" value={gymName} onChange={(e) => setGymName(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Address</label>
                      <input type="text" placeholder="123 Main St" value={gymAddress} onChange={(e) => setGymAddress(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Phone</label>
                      <input type="text" placeholder="09XX XXX XXXX" value={gymPhone} onChange={(e) => setGymPhone(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-primary)' }}>Your Account</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Your Name *</label>
                      <input type="text" placeholder="Juan Dela Cruz" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Email *</label>
                      <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Password *</label>
                      <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Must be at least 6 characters</p>
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
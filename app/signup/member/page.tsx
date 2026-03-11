'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, CheckCircle2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function MemberSignUpPage() {
  const supabase = createClient();

  const [step, setStep] = useState<'gym' | 'details' | 'done'>('gym');
  const [gymQuery, setGymQuery] = useState('');
  const [gyms, setGyms] = useState<{ id: string; name: string; code: string; address: string | null }[]>([]);
  const [selectedGym, setSelectedGym] = useState<{ id: string; name: string } | null>(null);
  const [searching, setSearching] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleGymQueryChange(query: string) {
    setGymQuery(query);
    setGyms([]);
    if (query.length < 2) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { data, error } = await supabase
        .from('gyms')
        .select('id, name, code, address')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
        .limit(5);
      if (error) console.error('Gym search error:', error.message);
      setGyms(data ?? []);
      setSearching(false);
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!selectedGym) { setError('Please select a gym first'); return; }
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setIsLoading(true);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'member' } },
    });
    if (authError) { setError(authError.message); setIsLoading(false); return; }
    if (!authData.user) { setError('Sign-up failed'); setIsLoading(false); return; }

    console.log("Passed here !");

    // 2. Sign in to get an authenticated session so the profile update is authorized
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError('Account created but could not sign in: ' + signInError.message); setIsLoading(false); return; }

    console.log("Passed here !!");

    // 3. Upsert the profile — works whether trigger created the row or not
    const qrCode = `stren://checkin/${selectedGym.id}/${authData.user.id}`;
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        { id: authData.user.id, email, name, role: 'member' as const, status: 'pending' as const, gym_id: selectedGym.id, qr_code: qrCode },
        { onConflict: 'id' }
      );

    if (profileError) { setError(profileError.message); setIsLoading(false); return; }

    console.log("Passed here !!");

    // 4. Sign out — member must wait for admin approval before logging in
    await supabase.auth.signOut();

    setIsLoading(false);
    setStep('done');
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

          {/* Done */}
          {step === 'done' ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
                Account Created!
              </h2>
              <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Your account is awaiting gym approval. You&apos;ll be able to log in once{' '}
                <strong>{selectedGym?.name}</strong> approves your membership.
              </p>
              <Link href="/login" className="inline-block py-3 px-8 rounded-lg font-semibold" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: 'var(--color-white)' }}>
                Go to Login
              </Link>
            </div>

          /* Step 1: Find gym */
          ) : step === 'gym' ? (
            <>
              <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                Find Your Gym
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Search by gym name or code
              </p>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. Iron Paradise or GYM-ABC"
                  value={gymQuery}
                  onChange={(e) => handleGymQueryChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none"
                  style={inputStyle}
                />
              </div>
              {searching && <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Searching...</p>}
              {gyms.length > 0 && (
                <div className="space-y-2 mb-6">
                  {gyms.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { setSelectedGym({ id: g.id, name: g.name }); setStep('details'); }}
                      className="w-full text-left p-4 rounded-lg border transition-all"
                      style={{ borderColor: 'var(--color-light-gray)', borderWidth: '1.5px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-light-gray)'; }}
                    >
                      <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{g.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Code: {g.code}{g.address ? ` · ${g.address}` : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {gymQuery.length >= 2 && gyms.length === 0 && !searching && (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  No gyms found. Ask your gym to register on Stren.
                </p>
              )}
            </>

          /* Step 2: Account details */
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                Create Account
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Joining <strong>{selectedGym?.name}</strong>{' '}
                <button onClick={() => setStep('gym')} className="underline" style={{ color: 'var(--color-primary)' }}>change</button>
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
                  <input type="text" placeholder="Juan Dela Cruz" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Must be at least 6 characters</p>
                </div>
                {error && <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full py-3 rounded-lg font-semibold uppercase tracking-widest transition-all hover:scale-105 active:scale-100" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', color: 'var(--color-white)', boxShadow: '0 4px 14px rgba(212,149,106,0.4)' }}>
                  {isLoading ? 'Creating...' : 'Create Account'}
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
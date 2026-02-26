'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock authentication - accept any email/password
    if (email && password) {
      // Store mock session
      localStorage.setItem('session', JSON.stringify({ email, role: 'admin' }));
      router.push('/dashboard');
    } else {
      setError('Please enter email and password');
    }

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
                src="/stren-logo.svg"
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
              Gym Management Platform
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
                placeholder="demo@stren.com"
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

          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-surface)' }}>
            <p 
              className="text-center text-xs mb-4 font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Demo credentials (any email/password works)
            </p>
            <div 
              className="space-y-2 text-sm p-3 rounded-md"
              style={{
                backgroundColor: 'var(--color-background)',
                borderLeft: '3px solid var(--color-primary)',
              }}
            >
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Admin:</strong> admin@stren.com / password
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Staff:</strong> staff@stren.com / password
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              New to Stren?{' '}
              <Link 
                href="/landing"
                className="font-semibold transition-colors"
                style={{ color: 'var(--color-primary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>

        <p 
          className="text-center text-xs mt-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Stren © 2025. All rights reserved.
        </p>
      </div>
    </div>
  );
}

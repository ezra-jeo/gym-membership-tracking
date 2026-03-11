'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, Building2 } from 'lucide-react';

export default function SignUpChooser() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-12">
          <Link href="/landing">
            <div className="h-20 w-20 relative cursor-pointer hover:opacity-80 transition-opacity">
              <Image src="/stren-logo.png" alt="Stren Logo" fill className="object-contain" />
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
          <div className="mb-8 text-center">
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}
            >
              Join Stren
            </h1>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              How would you like to get started?
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/signup/member"
              className="flex items-center gap-4 w-full p-5 rounded-lg border transition-all hover:scale-[1.02] active:scale-100"
              style={{ borderColor: 'var(--color-light-gray)', borderWidth: '1.5px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,149,106,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-light-gray)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(212,149,106,0.12)' }}
              >
                <Users className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <p className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  Join as Member
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Find your gym and start tracking workouts
                </p>
              </div>
            </Link>

            <Link
              href="/signup/admin"
              className="flex items-center gap-4 w-full p-5 rounded-lg border transition-all hover:scale-[1.02] active:scale-100"
              style={{ borderColor: 'var(--color-light-gray)', borderWidth: '1.5px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,149,106,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-light-gray)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(44,44,44,0.08)' }}
              >
                <Building2 className="h-6 w-6" style={{ color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <p className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  Register Your Gym
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Set up your gym on Stren and manage members
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold transition-colors"
                style={{ color: 'var(--color-primary)' }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Stren © 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}

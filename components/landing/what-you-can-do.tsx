import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const capabilities = [
  'Track attendance and payments in real-time',
  'Manage staff roles and member access',
  'Schedule classes and manage enrollments',
  'Know exactly who\u2019s paid and who\u2019s overdue',
];

export function WhatYouCanDo() {
  return (
    <section
      className="py-24 md:py-32 px-6 md:px-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative h-72 sm:h-80 md:h-[500px] rounded-2xl overflow-hidden">
            <Image
              src="/owner-success.jpg"
              alt="Gym owner managing operations"
              fill
              className="object-cover photo-warm"
            />
          </div>

          <div>
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--color-primary)' }}
            >
              What You Can Do
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-balance"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Everything in One Place
            </h2>
            <p
              className="text-lg leading-relaxed mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Stren gives you the tools to stay organized so you can spend more time on what matters — your members.
            </p>

            <div className="space-y-4 mb-8">
              {capabilities.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <p style={{ color: 'var(--color-text-secondary)' }}>{item}</p>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:translate-x-1"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
              }}
            >
              See It In Action <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

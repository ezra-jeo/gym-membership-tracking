'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ArrowRight, Users, BarChart3, Zap, Lock, Smartphone, CalendarDays } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Navigation */}
      <nav 
        className="sticky top-0 z-50 px-6 py-4 md:px-12 md:py-6 flex items-center justify-between border-b"
        style={{
          backgroundColor: 'var(--color-white)',
          borderColor: 'var(--color-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 relative">
            <Image src="/stren-logo.png" alt="Stren" fill className="object-contain" />
          </div>
          <span 
            className="text-2xl font-bold"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Stren
          </span>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <a 
            href="#features" 
            className="text-sm font-medium hidden md:block transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          >
            Features
          </a>
          <a 
            href="#benefits" 
            className="text-sm font-medium hidden md:block transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          >
            For Gyms
          </a>
          <Link href="/login">
            <button
              className="px-6 py-2 rounded-full font-semibold text-sm transition-all"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Sign In
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/landing-gym.jpg"
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(44, 44, 44, 0.35)' }}
          />
        </div>

        <div className="relative z-10 text-center text-white px-6 max-w-2xl">
          <p 
            className="text-sm md:text-base font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-primary-light)' }}
          >
            Gym Management, Simplified
          </p>
          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Stop Using Spreadsheets to Run Your Gym.
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-xl mx-auto">
            Stren replaces your notebooks, chat threads, and scattered receipts with one simple platform for members, payments, and check-ins.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button
                className="px-8 py-4 rounded-full font-semibold uppercase tracking-wide transition-all transform"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-white)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Get Started
              </button>
            </Link>
            <button
              className="px-8 py-4 rounded-full font-semibold uppercase tracking-wide border-2 transition-all"
              style={{
                borderColor: 'var(--color-white)',
                color: 'var(--color-white)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </button>
          </div>
        </div>

        <button
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10"
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown size={32} className="text-white" />
        </button>
      </section>

      {/* Core Features Section */}
      <section 
        id="features"
        className="py-24 md:py-32 px-6 md:px-12"
        style={{ backgroundColor: 'var(--color-white)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div>
              <p 
                className="text-sm font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-primary)' }}
              >
                Core Features
              </p>
              <h2 
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-balance"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
              >
                Everything Your Gym Needs in One Place
              </h2>
              <p 
                className="text-lg leading-relaxed mb-8"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                QR check-ins, member profiles, payment tracking, and a real-time dashboard — no extra hardware required. Just open Stren on any device.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-primary-glow)' }}
                  >
                    <Zap size={24} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-semibold mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      QR Code Check-In
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      Members scan a QR code to check in. You see who&apos;s in the gym at a glance.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-primary-glow)' }}
                  >
                    <BarChart3 size={24} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-semibold mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Dashboard & Reports
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      See attendance, revenue, and member trends on a clean dashboard. Export reports when you need them.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-primary-glow)' }}
                  >
                    <Users size={24} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-semibold mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Member Profiles
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      Each member gets a profile with their plan, payment history, attendance log, and class enrollments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-96 md:h-full min-h-96 rounded-2xl overflow-hidden">
              <Image
                src="/gym-empty.jpg"
                alt="Modern Gym"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* What You Can Do Section */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative h-96 md:h-full min-h-96 rounded-2xl overflow-hidden order-2 md:order-1">
              <Image
                src="/owner-success.jpg"
                alt="Gym owner managing operations"
                fill
                className="object-cover"
              />
            </div>

            <div className="order-1 md:order-2">
              <p 
                className="text-sm font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-primary)' }}
              >
                What You Can Do
              </p>
              <h2 
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-balance"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
              >
                Run Your Gym Like a Real Business
              </h2>
              <p 
                className="text-lg leading-relaxed mb-8"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Stren gives you the tools to stay organized so you can spend more time on what matters — your members.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Track attendance and payments in real-time
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Manage staff roles and member access
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Schedule classes and manage enrollments
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Know exactly who&apos;s paid and who&apos;s overdue
                  </p>
                </div>
              </div>

              <Link href="/login">
                <button
                  className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-white)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(8px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  Try It Out <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Works Section */}
      <section 
        id="benefits"
        className="py-24 md:py-32 px-6 md:px-12"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p 
              className="text-sm font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--color-primary)' }}
            >
              Built for Simplicity
            </p>
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              No Complexity. No Overhead.
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Stren is designed for independent gyms that want something better than spreadsheets — without the bloat of enterprise software.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lock, label: 'Your Data Stays Safe', desc: 'Member information is stored securely. No paper trails, no scattered screenshots.' },
              { icon: Smartphone, label: 'Works on Any Device', desc: 'Use it on your phone, tablet, or computer. No special hardware or scanners needed.' },
              { icon: CalendarDays, label: 'Simple to Start', desc: 'Set up your gym, add members, and start tracking — it takes minutes, not days.' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-xl border transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderColor: 'var(--color-surface)',
                  borderWidth: '1px',
                }}
              >
                <div 
                  className="p-4 rounded-lg mb-4 w-fit"
                  style={{ backgroundColor: 'var(--color-primary-glow)' }}
                >
                  <item.icon size={28} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {item.label}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-bleed Image Section */}
      <section className="relative h-96 md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/community-moment.jpg"
            alt="Community"
            fill
            className="object-cover"
          />
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(44, 44, 44, 0.3)' }}
          />
        </div>

        <div className="relative z-10 text-center text-white px-6 max-w-2xl">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Built for Independent Gyms, Not Chains.
          </h2>
          <p className="text-lg mb-8 text-gray-100">
            You don&apos;t need enterprise software. You need a tool that actually fits how you work.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-24 md:py-32 px-6 md:px-12"
        style={{ backgroundColor: 'var(--color-white)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Ready to Try Stren?
          </h2>
          <p 
            className="text-xl mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            We&apos;re building Stren for gym owners who are tired of managing with notebooks and chat threads. Sign in and see what it can do.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <button
                className="px-10 py-4 rounded-full font-semibold uppercase tracking-wide transition-all transform"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-white)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Get Started
              </button>
            </Link>
          </div>

          <div 
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-surface)',
              borderWidth: '1px',
            }}
          >
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Stren is in early development. We&apos;d love your feedback as we build this out.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="border-t py-12 px-6 md:px-12"
        style={{
          backgroundColor: 'var(--color-charcoal)',
          borderColor: 'var(--color-graphite)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 relative">
                <Image src="/stren-logo.png" alt="Stren" fill className="object-contain" />
              </div>
              <span 
                className="text-lg font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                Stren
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
              © 2026 Stren. A gym management platform in the making.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

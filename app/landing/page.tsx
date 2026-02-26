'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ArrowRight, Users, BarChart3, Zap, Lock } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');

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
            The Future of Gym Management
          </p>
          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Your Members First. Everything Else Second.
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-xl mx-auto">
            Stop managing with spreadsheets. Start growing your gym with Stren—the intelligent platform that makes every check-in count.
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
                Start Free Trial
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
            >
              Watch Demo
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

      {/* Inspiring Places Section */}
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
                Inspiring Places
              </p>
              <h2 
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-balance"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
              >
                Built for the Modern Gym
              </h2>
              <p 
                className="text-lg leading-relaxed mb-8"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Every detail of Stren is designed with your member experience in mind. From the moment they scan a QR code to when they check their progress, every touchpoint matters.
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
                      Instant Check-In
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      QR code scanning makes entry effortless. No more lines, no more friction.
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
                      Real-Time Insights
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      Watch your business metrics in real-time. Attendance, revenue, member trends—all at your fingertips.
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
                      Member Engagement
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      Keep members engaged with personalized profiles, class bookings, and achievement tracking.
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

          {/* Results-Driven Section */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative h-96 md:h-full min-h-96 rounded-2xl overflow-hidden order-2 md:order-1">
              <Image
                src="/owner-success.jpg"
                alt="Results"
                fill
                className="object-cover"
              />
            </div>

            <div className="order-1 md:order-2">
              <p 
                className="text-sm font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-primary)' }}
              >
                Results-Driven
              </p>
              <h2 
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-balance"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
              >
                Grow Your Business
              </h2>
              <p 
                className="text-lg leading-relaxed mb-8"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Gym owners using Stren see immediate results: better member retention, smarter business decisions, and more time doing what you love.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Track attendance and revenue in real-time
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Manage staff and member roles effortlessly
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Schedule classes and send member notifications
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
                  Explore Features <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Passionate People Section */}
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
              Passionate Community
            </p>
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Built for Gym Owners Who Care
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Join hundreds of gym owners who are transforming their business with Stren. See why they're growing faster than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lock, label: 'Secure & Reliable', desc: 'Enterprise-grade security keeps your member data safe 24/7.' },
              { icon: Zap, label: 'Lightning Fast', desc: 'QR scanning works instantly, even with thousands of members.' },
              { icon: Users, label: 'Easy Management', desc: 'Intuitive interface means your team learns it in minutes.' },
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

      {/* Community Moment */}
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
            One Platform. Unlimited Growth.
          </h2>
          <p className="text-lg mb-8 text-gray-100">
            From single locations to multi-location empires, Stren scales with your ambitions.
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
            Ready to Transform Your Gym?
          </h2>
          <p 
            className="text-xl mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Join the gym owners revolutionizing their business with Stren. Start your free trial today—no credit card required.
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
                Start Free Trial
              </button>
            </Link>
            <button
              className="px-10 py-4 rounded-full font-semibold uppercase tracking-wide border-2 transition-all"
              style={{
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-glow)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Schedule Demo
            </button>
          </div>

          <div 
            className="p-8 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-surface)',
              borderWidth: '1px',
            }}
          >
            <p 
              className="text-sm mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Get expert advice tailored to your gym
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="your@gym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderColor: 'var(--color-light-gray)',
                  borderWidth: '1.5px',
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
              <button
                className="px-8 py-3 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-white)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="border-t py-16 px-6 md:px-12"
        style={{
          backgroundColor: 'var(--color-charcoal)',
          borderColor: 'var(--color-graphite)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
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
              <p className="text-sm" style={{ color: 'var(--color-light-gray)' }}>
                The modern gym management platform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-white)' }}>Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Security', 'Status'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-sm transition-colors"
                      style={{ color: 'var(--color-gray)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray)'}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-white)' }}>Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-sm transition-colors"
                      style={{ color: 'var(--color-gray)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray)'}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-white)' }}>Legal</h4>
              <ul className="space-y-2">
                {['Privacy', 'Terms', 'Security', 'Compliance'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-sm transition-colors"
                      style={{ color: 'var(--color-gray)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray)'}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div 
            className="border-t pt-8"
            style={{ borderColor: 'var(--color-graphite)' }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                © 2024 Stren. All rights reserved.
              </p>
              <div className="flex gap-6">
                {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: 'var(--color-gray)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray)'}
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  QrCode,
  CreditCard,
  Users,
  BarChart3,
  CalendarDays,
  Dumbbell,
  Check,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  tab: string;
  headline: string;
  description: string;
  bullets: string[];
  image: string;
  imageAlt: string;
}

const features: Feature[] = [
  {
    icon: QrCode,
    tab: 'QR Check-In',
    headline: 'Members show up. You scan them in.',
    description:
      'Each member has a QR code. Your front desk scans it — instant check-in, real-time headcount.',
    bullets: [
      'Front desk scans member QR in seconds',
      'Live headcount visible to owner',
      'Automatic attendance history',
    ],
    image: '/hero-checkin.jpg',
    imageAlt: 'QR check-in screen on phone',
  },
  {
    icon: CreditCard,
    tab: 'Payment Tracking',
    headline: 'Know exactly who\u2019s paid.',
    description:
      'Track dues, flag overdue members, stay on top of revenue. No more chasing through group chats.',
    bullets: [
      'Overdue flags with instant visibility',
      'Revenue summary at a glance',
      'Payment history per member',
    ],
    image: '/hero-dashboard.jpg',
    imageAlt: 'Payment tracking dashboard',
  },
  {
    icon: Users,
    tab: 'Member Profiles',
    headline: 'Every member, one profile.',
    description:
      'Plans, payments, attendance — all in one place. Search any member and see everything.',
    bullets: [
      'Full membership and visit history',
      'Instant search across all members',
    ],
    image: '/hero-members.jpg',
    imageAlt: 'Member profile view',
  },
  {
    icon: BarChart3,
    tab: 'Dashboard & Reports',
    headline: 'See your gym\u2019s health at a glance.',
    description:
      'Revenue, attendance trends, membership growth. A real dashboard built for gym owners.',
    bullets: [
      'No spreadsheets needed',
      'Visual trends you can act on',
    ],
    image: '/hero-owner.jpg',
    imageAlt: 'Gym analytics dashboard',
  },
  {
    icon: CalendarDays,
    tab: 'Class Scheduling',
    headline: 'Schedule sessions, manage capacity.',
    description:
      'Set up classes, manage enrollments, let members book their spots on one calendar.',
    bullets: [
      'Class capacity limits',
      'Member self-booking',
    ],
    image: '/hero-dashboard.jpg',
    imageAlt: 'Class scheduling view',
  },
  {
    icon: Dumbbell,
    tab: 'Trainer Management',
    headline: 'Assign trainers. Track their sessions.',
    description:
      'Know which trainer handles which member. Track session counts, schedules, and availability.',
    bullets: [
      'Trainer-member assignment',
      'Session count tracking',
    ],
    image: '/hero-members.jpg',
    imageAlt: 'Trainer management view',
  },
];

export function FeatureTabViewer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const switchTab = useCallback(
    (idx: number) => {
      if (idx === activeIndex) return;
      setTransitioning(true);
      // Brief fade-out before switching content
      setTimeout(() => {
        setActiveIndex(idx);
        setTransitioning(false);
      }, 150);
    },
    [activeIndex],
  );

  const active = features[activeIndex];

  return (
    <section
      id="features"
      className="py-28 lg:py-36 px-6 lg:px-12"
      style={{ backgroundColor: 'var(--color-white)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <p
            className="text-sm font-semibold uppercase tracking-[0.15em] mb-4"
            style={{ color: 'var(--color-primary)', fontSize: 'var(--type-label)' }}
          >
            What Stren Does
          </p>
          <h2
            className="font-bold leading-tight max-w-2xl mx-auto"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--type-section)',
              color: 'var(--color-text-primary)',
            }}
          >
            Here&apos;s what Stren handles for you.
          </h2>
        </div>

        {/* Mobile: horizontal scrollable pill bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 lg:hidden scrollbar-hide">
          {features.map((feat, idx) => (
            <button
              key={feat.tab}
              type="button"
              onClick={() => switchTab(idx)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor:
                  idx === activeIndex
                    ? 'var(--color-primary)'
                    : 'var(--color-background)',
                color:
                  idx === activeIndex
                    ? '#FFFFFF'
                    : 'var(--color-text-secondary)',
              }}
            >
              {feat.tab}
            </button>
          ))}
        </div>

        {/* Desktop: two-column tab layout */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-16">
          {/* Tab list — hidden on mobile (pills shown instead) */}
          <div className="hidden lg:flex flex-col gap-1" role="tablist">
            {features.map((feat, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={feat.tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => switchTab(idx)}
                  className="flex items-center gap-3 text-left px-5 py-4 rounded-lg transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: isActive
                      ? 'var(--color-primary-glow)'
                      : 'transparent',
                    borderLeft: isActive
                      ? '3px solid var(--color-primary)'
                      : '3px solid transparent',
                  }}
                >
                  <feat.icon
                    size={20}
                    style={{
                      color: isActive
                        ? 'var(--color-primary)'
                        : 'var(--color-text-muted)',
                    }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: isActive
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-secondary)',
                    }}
                  >
                    {feat.tab}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content panel */}
          <div
            role="tabpanel"
            className="transition-opacity duration-200 ease-out"
            style={{ opacity: transitioning ? 0 : 1 }}
          >
            {/* Detail text */}
            <div className="mb-8">
              <div
                className="p-3 rounded-xl mb-5 w-fit"
                style={{ backgroundColor: 'var(--color-primary-glow)' }}
              >
                <active.icon size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3
                className="text-2xl lg:text-3xl font-bold mb-4 leading-snug"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {active.headline}
              </h3>
              <p
                className="leading-relaxed max-w-lg mb-6"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--type-body)',
                }}
              >
                {active.description}
              </p>

              {/* Micro-bullets */}
              <ul className="space-y-2.5">
                {active.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--color-success)' }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature image */}
            <div className="relative aspect-[4/3] lg:h-[360px] lg:aspect-auto rounded-2xl overflow-hidden">
              <Image
                src={active.image}
                alt={active.imageAlt}
                fill
                className="object-cover photo-warm transition-opacity duration-250 ease-out"
                loading="lazy"
                style={{ opacity: transitioning ? 0 : 1 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

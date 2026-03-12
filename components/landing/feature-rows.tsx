import Image from 'next/image';
import {
  QrCode,
  CreditCard,
  Users,
  BarChart3,
  CalendarDays,
  Dumbbell,
} from 'lucide-react';

const features = [
  {
    icon: QrCode,
    headline: 'Members scan. You see who\u2019s inside.',
    description:
      'One tap to check in — no front desk needed. Real-time attendance view so you always know how many people are in your gym.',
    image: '/hero-checkin.jpg',
    imageAlt: 'QR check-in screen on phone',
  },
  {
    icon: CreditCard,
    headline: 'Know exactly who\u2019s paid.',
    description:
      'Track dues, flag overdue members, and stay on top of your revenue. No more chasing payments through group chats.',
    image: '/hero-dashboard.jpg',
    imageAlt: 'Payment tracking dashboard',
  },
  {
    icon: Users,
    headline: 'Every member, one profile.',
    description:
      'Plans, payments, attendance history — all in one place. Search any member and see everything at a glance.',
    image: '/hero-members.jpg',
    imageAlt: 'Member profile view',
  },
  {
    icon: BarChart3,
    headline: 'See your gym\u2019s health at a glance.',
    description:
      'Revenue, attendance trends, membership growth — no spreadsheets. A real dashboard built for gym owners.',
    image: '/hero-owner.jpg',
    imageAlt: 'Gym analytics dashboard',
  },
  {
    icon: CalendarDays,
    headline: 'Schedule sessions, manage class capacity.',
    description:
      'Set up classes, manage enrollments, and let members book their spots. Everything runs on one calendar.',
    image: '/hero-dashboard.jpg',
    imageAlt: 'Class scheduling view',
  },
  {
    icon: Dumbbell,
    headline: 'Assign trainers. Track their sessions.',
    description:
      'Know which trainer is handling which member. Track session counts, schedules, and availability from one place.',
    image: '/hero-members.jpg',
    imageAlt: 'Trainer management view',
  },
];

/* Compact summary table data */
const summaryModules = [
  { name: 'QR Check-In', desc: 'Phone-based check-in, real-time attendance view' },
  { name: 'Payment Tracking', desc: 'Due tracking, overdue flags, revenue reports' },
  { name: 'Member Profiles', desc: 'Full member history — plans, payments, visits' },
  { name: 'Dashboard & Reports', desc: 'Revenue, attendance, growth charts' },
  { name: 'Class Scheduling', desc: 'Session scheduling, enrollment management' },
  { name: 'Trainer Management', desc: 'Trainer assignment, session tracking' },
];

export function FeatureRows() {
  return (
    <section
      id="features"
      className="py-28 lg:py-36 px-6 lg:px-12"
      style={{ backgroundColor: 'var(--color-white)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
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
            Everything your gym needs. Nothing it doesn&apos;t.
          </h2>
        </div>

        {/* Alternating feature rows */}
        <div className="space-y-24 lg:space-y-32">
          {features.map((feat, idx) => {
            const isReversed = idx % 2 !== 0;
            return (
              <div
                key={feat.headline}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  isReversed ? 'lg:[direction:rtl]' : ''
                }`}
              >
                {/* Image */}
                <div
                  className="relative h-64 sm:h-80 lg:h-[420px] rounded-2xl overflow-hidden"
                  style={{ direction: 'ltr' }}
                >
                  <Image
                    src={feat.image}
                    alt={feat.imageAlt}
                    fill
                    className="object-cover photo-warm"
                    loading="lazy"
                  />
                </div>

                {/* Text */}
                <div style={{ direction: 'ltr' }}>
                  <div
                    className="p-3 rounded-xl mb-5 w-fit"
                    style={{ backgroundColor: 'var(--color-primary-glow)' }}
                  >
                    <feat.icon size={24} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3
                    className="text-2xl lg:text-3xl font-bold mb-4 leading-snug"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {feat.headline}
                  </h3>
                  <p
                    className="leading-relaxed max-w-md"
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--type-body)',
                    }}
                  >
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact summary table */}
        <div
          className="mt-28 p-8 lg:p-10 rounded-2xl border"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-surface)',
            borderWidth: '1.5px',
          }}
        >
          <h3
            className="text-xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            At a Glance
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            {summaryModules.map((mod) => (
              <div key={mod.name} className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                  style={{ backgroundColor: 'var(--color-success)' }}
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {mod.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {mod.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

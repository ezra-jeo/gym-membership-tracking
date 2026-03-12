import { QrCode, CreditCard, Users, BarChart3, CalendarDays, Dumbbell } from 'lucide-react';

const modules = [
  {
    icon: QrCode,
    name: 'QR Check-In',
    description: 'Members scan to check in. You see who\'s inside at a glance.',
    status: 'active' as const,
  },
  {
    icon: CreditCard,
    name: 'Payment Tracking',
    description: 'Know exactly who\'s paid, who\'s overdue, and when.',
    status: 'active' as const,
  },
  {
    icon: Users,
    name: 'Member Profiles',
    description: 'Plans, payment history, and attendance — all in one profile.',
    status: 'active' as const,
  },
  {
    icon: BarChart3,
    name: 'Dashboard & Reports',
    description: 'Revenue, attendance trends, and membership growth at a glance.',
    status: 'active' as const,
  },
  {
    icon: CalendarDays,
    name: 'Class Scheduling',
    description: 'Schedule sessions, manage enrollments, and track capacity.',
    status: 'coming-soon' as const,
  },
  {
    icon: Dumbbell,
    name: 'Trainer Management',
    description: 'Assign trainers to members and track their sessions.',
    status: 'coming-soon' as const,
  },
];

export function FeatureShowcase() {
  return (
    <section
      id="features"
      className="py-24 md:py-32 px-6 md:px-12"
      style={{ backgroundColor: 'var(--color-white)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            Modular by Design
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-balance"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            What You Can Toggle for Your Gym
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Every gym is different. Turn on what you need now — add more as you grow.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className="group relative p-5 sm:p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: 'var(--color-white)',
                borderColor: 'var(--color-surface)',
                borderWidth: '1.5px',
              }}
            >
              <div
                className="mb-4 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor:
                    mod.status === 'active'
                      ? 'var(--color-primary-glow)'
                      : 'var(--color-surface)',
                }}
              >
                <mod.icon
                  size={22}
                  style={{
                    color:
                      mod.status === 'active'
                        ? 'var(--color-primary)'
                        : 'var(--color-gray)',
                  }}
                />
              </div>

              <h3
                className="text-sm sm:text-base md:text-lg font-bold mb-1.5 md:mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {mod.name}
              </h3>

              <p
                className="text-sm leading-relaxed mb-4 hidden sm:block"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {mod.description}
              </p>

              {/* Status pill */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                  style={{
                    backgroundColor:
                      mod.status === 'active'
                        ? 'var(--color-success)'
                        : 'var(--color-light-gray)',
                  }}
                />
                <span
                  className="text-[10px] md:text-xs font-medium uppercase tracking-wider"
                  style={{
                    color:
                      mod.status === 'active'
                        ? 'var(--color-success)'
                        : 'var(--color-gray)',
                  }}
                >
                  {mod.status === 'active' ? 'Active' : 'Coming Soon'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

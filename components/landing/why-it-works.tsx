import { Lock, Smartphone, CalendarDays } from 'lucide-react';

const benefits = [
  {
    icon: Lock,
    label: 'Your Data Stays Safe',
    desc: 'Member information is stored securely. No paper trails, no scattered screenshots.',
  },
  {
    icon: Smartphone,
    label: 'Works on Any Device',
    desc: 'Use it on your phone, tablet, or computer. No special hardware or scanners needed.',
  },
  {
    icon: CalendarDays,
    label: 'Simple to Start',
    desc: 'Set up your gym, add members, and start tracking — it takes minutes, not days.',
  },
];

export function WhyItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32 px-6 md:px-12"
      style={{ backgroundColor: 'var(--color-white)' }}
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
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            No Learning Curve. No Extra Equipment.
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Stren is designed for independent gyms that want something better than
            spreadsheets — without the bloat of enterprise software.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((item) => (
            <div
              key={item.label}
              className="p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: 'var(--color-white)',
                borderColor: 'var(--color-surface)',
                borderWidth: '1.5px',
              }}
            >
              <div
                className="p-4 rounded-xl mb-5 w-fit"
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
              <p
                className="leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

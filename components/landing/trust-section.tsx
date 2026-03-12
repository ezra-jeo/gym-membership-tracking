import { Shield, Smartphone, Zap } from 'lucide-react';

const trustPoints = [
  { icon: Zap, text: 'Free during pilot' },
  { icon: Shield, text: 'No hardware needed' },
  { icon: Smartphone, text: 'Works on any phone' },
];

export function TrustSection() {
  return (
    <section
      className="py-24 md:py-32 px-6 md:px-12"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Founder Story */}
        <div className="text-center mb-16">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            Our Story
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 leading-tight"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Why We&apos;re Building Stren
          </h2>
          <blockquote
            className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            &ldquo;We noticed gyms in the Philippines still rely on notebooks and
            chat groups to track everything. We think gym owners deserve better
            tools — ones that are simple, affordable, and built for how you
            actually work.&rdquo;
          </blockquote>
          <p
            className="mt-6 text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            The Stren Team
          </p>
        </div>

        {/* Testimonial Placeholders */}
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-white)',
                borderColor: 'var(--color-surface)',
                borderWidth: '1.5px',
              }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <div
                    key={s}
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary-glow)' }}
                  />
                ))}
              </div>
              <p
                className="text-sm italic leading-relaxed mb-4"
                style={{ color: 'var(--color-text-muted)' }}
              >
                &ldquo;Testimonial from pilot gym owner — coming soon.&rdquo;
              </p>
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-light-gray)' }}
              >
                Pilot Gym #{i}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {trustPoints.map((point) => (
            <div
              key={point.text}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{ backgroundColor: 'var(--color-white)' }}
            >
              <point.icon
                size={16}
                style={{ color: 'var(--color-primary)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {point.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

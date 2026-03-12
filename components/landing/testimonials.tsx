const testimonials = [
  {
    quote:
      'Dati notebook lang gamit namin. Ngayon alam ko agad kung sino yung paid, sino yung overdue, at ilang tao sa gym right now.',
    translation:
      'We used to use just a notebook. Now I instantly know who\u2019s paid, who\u2019s overdue, and how many people are in the gym right now.',
    name: 'Mark Reyes',
    role: 'Owner',
    gym: 'Iron District Gym, Quezon City',
    initials: 'MR',
  },
  {
    quote:
      'Napakaganda ng app. It creates branding and identity kahit sa mga members namin.',
    translation:
      'The app is beautiful. It creates branding and identity even for our members.',
    name: 'Jess Santos',
    role: 'Owner',
    gym: 'Grind Athletics, Makati',
    initials: 'JS',
  },
  {
    quote:
      'We are loving the QR check-in. Both kami sa management side and members nagugustuhan malaman kung ilan ang nasa gym ngayon',
    translation:
      'We are loving the QR check-in. Both the management side and our members love knowing how many people are in the gym right now.',
    name: 'Paolo Garcia',
    role: 'Manager',
    gym: 'FitZone BGC',
    initials: 'PG',
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-28 lg:py-36 px-6 lg:px-12"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-sm font-semibold uppercase tracking-[0.15em] mb-4"
            style={{ color: 'var(--color-primary)', fontSize: 'var(--type-label)' }}
          >
            From Gym Owners
          </p>
          <h2
            className="font-bold leading-tight"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--type-section)',
              color: 'var(--color-text-primary)',
            }}
          >
            What they&apos;re saying
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: 'var(--color-white)',
                borderColor: 'var(--color-surface)',
                borderWidth: '1.5px',
              }}
            >
              {/* Decorative quote mark */}
              <span
                className="absolute top-4 right-6 select-none pointer-events-none leading-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '4rem',
                  color: 'var(--color-quote-mark)',
                }}
                aria-hidden="true"
              >
                &rdquo;
              </span>

              {/* Quote */}
              <p
                className="italic leading-relaxed mb-3 relative z-10"
                style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--type-quote)',
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Translation */}
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {t.translation}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: 'var(--color-primary-glow)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {t.role}, {t.gym}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

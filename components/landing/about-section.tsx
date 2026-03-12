export function AboutSection() {
  return (
    <section
      id="about"
      className="py-28 lg:py-36 px-6 lg:px-12"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-2xl mx-auto text-center relative">
        {/* Decorative quote mark */}
        <span
          className="absolute -top-8 left-1/2 -translate-x-1/2 select-none pointer-events-none leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '8rem',
            color: 'var(--color-quote-mark)',
          }}
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <p
          className="text-sm font-semibold uppercase tracking-[0.15em] mb-5"
          style={{ color: 'var(--color-primary)', fontSize: 'var(--type-label)' }}
        >
          Why We Built Stren
        </p>

        <h2
          className="font-bold mb-8 leading-tight"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--type-section)',
            color: 'var(--color-text-primary)',
          }}
        >
          Software made for independent gyms
        </h2>

        <div
          className="space-y-5 leading-relaxed"
          style={{ fontSize: 'var(--type-body)', color: 'var(--color-text-secondary)' }}
        >
          <p>
            We watched gym owners in the Philippines track memberships in notebooks,
            chase payments through group chats, and lose count of who actually showed up.
          </p>
          <p>
            Stren is the system we wish existed — simple enough to learn in minutes,
            powerful enough to run your entire gym. No contracts, no complicated setup,
            no enterprise pricing.
          </p>
          <p style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
            Just the tools you need to focus on what you do best: your members.
          </p>
        </div>

        <p
          className="mt-8 text-sm font-semibold tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          — The Stren Team
        </p>
      </div>
    </section>
  );
}

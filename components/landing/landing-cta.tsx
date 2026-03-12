import Link from 'next/link';

export function LandingCTA() {
  return (
    <section
      className="py-24 md:py-32 px-6 md:px-12"
      style={{ backgroundColor: 'var(--color-white)' }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Want to See How It Works for Your Gym?
        </h2>
        <p
          className="text-lg md:text-xl mb-10"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          We built Stren for gym owners who want clarity and control.
          Try the dashboard — it takes 30 seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="px-10 py-4 rounded-full font-semibold uppercase tracking-wide transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              boxShadow: '0 4px 24px rgba(212, 149, 106, 0.3)',
            }}
          >
            See It In Action
          </Link>
          <Link
            href="/signup/admin"
            className="px-10 py-4 rounded-full font-semibold uppercase tracking-wide border-2 transition-all duration-200 hover:scale-105"
            style={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
            }}
          >
            Register Your Gym
          </Link>
        </div>

        <div
          className="p-5 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-surface)',
            borderWidth: '1px',
          }}
        >
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Stren is in early development. We&apos;d love your feedback as we
            build this out.
          </p>
        </div>
      </div>
    </section>
  );
}

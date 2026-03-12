import Image from 'next/image';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer
      className="border-t py-12 px-6 md:px-12"
      style={{
        backgroundColor: 'var(--color-charcoal)',
        borderColor: 'var(--color-graphite)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="h-8 w-8 relative">
              <Image
                src="/stren-logo.png"
                alt="Stren"
                fill
                className="object-contain"
              />
            </div>
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              Stren
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm transition-colors duration-200 hover:opacity-80"
              style={{ color: 'var(--color-gray)' }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm transition-colors duration-200 hover:opacity-80"
              style={{ color: 'var(--color-gray)' }}
            >
              How It Works
            </a>
            <Link
              href="/login"
              className="text-sm transition-colors duration-200 hover:opacity-80"
              style={{ color: 'var(--color-gray)' }}
            >
              Sign In
            </Link>
          </div>

          <p className="text-sm" style={{ color: 'var(--color-smoke)' }}>
            © 2026 Stren. Built for independent gyms.
          </p>
        </div>
      </div>
    </footer>
  );
}

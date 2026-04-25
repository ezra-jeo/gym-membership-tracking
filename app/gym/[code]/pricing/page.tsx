import Link from 'next/link';
import { Check } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getGymPublicByCode } from '@/lib/gym-public';
import { toPricingPackages } from '@/lib/gym-data';
import type { Json } from '@/lib/database.types';

type PageProps = { params: Promise<{ code: string }> | { code: string } };

export const revalidate = 86400;

export default async function PricingPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const { code, data } = await getGymPublicByCode(rawCode);
  if (!data || !data.is_published) notFound();

  const packages = toPricingPackages(data.pricing_packages as Json | null);

  return (
    <div>
      <section
        className="px-6 py-20 md:px-16 md:py-28"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
            Membership options
          </p>
          <h1
            className="mt-3 text-4xl font-bold text-white sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Pricing
          </h1>
        </div>
      </section>

      <section style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-24">
          {packages && packages.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className="relative flex flex-col overflow-hidden rounded-2xl border"
                  style={{
                    backgroundColor: 'var(--color-white)',
                    borderColor: pkg.is_featured ? 'var(--color-primary)' : 'var(--color-surface)',
                    borderWidth: pkg.is_featured ? '2px' : '1px',
                  }}
                >
                  {pkg.is_featured && (
                    <div
                      className="py-1.5 text-center text-xs font-semibold uppercase tracking-widest"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }}
                    >
                      Most Popular
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--color-text-muted)' }}>
                      {pkg.duration}
                    </p>
                    <h3 className="mt-2 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {pkg.name}
                    </h3>
                    <p className="mt-3 text-3xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
                      {pkg.price}
                    </p>

                    {pkg.features.length > 0 && (
                      <ul className="mt-6 flex-1 space-y-2.5">
                        {pkg.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5">
                            <Check
                              size={16}
                              className="mt-0.5 shrink-0"
                              style={{ color: 'var(--color-primary)' }}
                            />
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-8">
                      <Link href={`/gym/${encodeURIComponent(code)}/signup`}>
                        <button
                          className="w-full rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                          style={
                            pkg.is_featured
                              ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }
                              : { backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }
                          }
                        >
                          Get Started
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
                Pricing details coming soon. Contact us for membership rates.
              </p>
              <Link
                href={`/gym/${code}/contact`}
                className="mt-4 inline-block text-sm font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                Contact us →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

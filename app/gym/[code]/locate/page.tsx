import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { getGymPublicByCode } from '@/lib/gym-public';

type PageProps = { params: Promise<{ code: string }> | { code: string } };

export const revalidate = 86400;

export default async function LocatePage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const { data } = await getGymPublicByCode(rawCode);
  if (!data || !data.is_published) notFound();

  return (
    <div>
      <section
        className="px-6 py-20 md:px-16 md:py-28"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
            Find us
          </p>
          <h1
            className="mt-3 text-4xl font-bold text-white sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Locate Us
          </h1>
          {data.address && (
            <p className="mt-4 flex items-center gap-2 text-white/80">
              <MapPin size={16} className="shrink-0" />
              {data.address}
            </p>
          )}
        </div>
      </section>

      {data.map_embed_url && (
        <section style={{ backgroundColor: 'var(--color-white)' }}>
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--color-primary)' }}>
              Map
            </p>
            <h2
              className="mt-4 text-2xl font-bold sm:text-3xl"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              We are here
            </h2>
            <div className="mt-8 overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--color-surface)' }}>
              <iframe
                src={data.map_embed_url}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${data.name} location map`}
              />
            </div>

            {data.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                Open in Google Maps →
              </a>
            )}
          </div>
        </section>
      )}

      {data.directions && (
        <section style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--color-primary)' }}>
              How to get here
            </p>
            <h2
              className="mt-4 text-2xl font-bold sm:text-3xl"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Landmarks & Directions
            </h2>
            <div
              className="mt-6 whitespace-pre-wrap text-base leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {data.directions}
            </div>
          </div>
        </section>
      )}

      {!data.map_embed_url && !data.directions && data.address && (
        <section style={{ backgroundColor: 'var(--color-white)' }}>
          <div className="mx-auto max-w-5xl px-6 py-20 text-center md:px-16">
            <MapPin size={32} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {data.address}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full border px-6 py-2.5 text-sm font-medium"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              Open in Google Maps →
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Facebook, Instagram, Globe } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { brandColorVars } from '@/lib/brand-color';
import type { Json } from '@/lib/database.types';

type GymData = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  brand_color: string;
  operating_hours: Record<string, string> | null;
  amenities: string[] | null;
  social_links: { facebook?: string; instagram?: string; website?: string } | null;
  member_count: number;
  is_published: boolean;
};

type PageProps = {
  params: Promise<{ code: string }> | { code: string };
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export default async function GymPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase.rpc('get_gym_by_code', { p_code: code });
  if (!data) notFound();

  const gym: GymData = {
    ...data,
    operating_hours: toOperatingHours(data.operating_hours),
    social_links: toSocialLinks(data.social_links),
  };

  if (!gym.is_published) {
    return (
      <>
        <style>{`:root { ${brandColorVars(gym.brand_color)} }`}</style>
        <ComingSoonPage gym={gym} />
      </>
    );
  }

  return (
    <>
      <style>{`:root { ${brandColorVars(gym.brand_color)} }`}</style>
      <GymLandingPage gym={gym} />
    </>
  );
}

function ComingSoonPage({ gym }: { gym: GymData }) {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
    >
      <div className="flex min-h-screen items-center justify-center px-5 sm:px-6">
        <div className="max-w-3xl text-center">
          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl"
            style={{ color: 'var(--color-white)', fontFamily: 'var(--font-heading)' }}
          >
            {gym.name}
          </h1>
          <p className="mt-4 text-xl sm:text-2xl" style={{ color: 'var(--color-white)', opacity: 0.8 }}>
            Coming soon.
          </p>
          <Link href={`/signup/member?gym=${encodeURIComponent(gym.code)}`} className="mt-10 inline-block">
            <button
              className="w-full max-w-[90vw] rounded-full px-8 py-4 text-base font-semibold sm:w-auto sm:max-w-none sm:px-10"
              style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-primary)' }}
            >
              Join {gym.name}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function GymLandingPage({ gym }: { gym: GymData }) {
  const hasAmenities = !!gym.amenities && gym.amenities.length > 0;
  const hasSocial = !!gym.social_links && (!!gym.social_links.facebook || !!gym.social_links.instagram || !!gym.social_links.website);
  const hasContact = !!gym.address || !!gym.phone;
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-sm"
        style={{ background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.25))' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 md:px-16 md:py-3">
          <p className="max-w-[65vw] truncate text-[11px] font-medium uppercase tracking-[0.18em] text-white/85 sm:text-xs md:max-w-none md:text-sm md:tracking-[0.2em]">
            {gym.name}
          </p>
          <Link href={`/signup/member?gym=${encodeURIComponent(gym.code)}`}>
            <button
              className="rounded-full px-4 py-1.5 text-xs font-semibold sm:px-5 sm:py-2 md:text-sm"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }}
            >
              Join
            </button>
          </Link>
        </div>
      </nav>

      <header className="relative min-h-[90vh] overflow-hidden md:min-h-screen">
        {gym.cover_url ? (
          <>
            <Image src={gym.cover_url} alt={gym.name} fill className="object-cover" sizes="100vw" priority />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.65))' }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
          />
        )}

        <div className="relative z-10 flex min-h-[90vh] items-end md:min-h-screen">
          <div className="w-full px-5 pb-14 sm:px-6 sm:pb-16 md:px-16 md:pb-24">
            <div className="max-w-4xl">
              {gym.logo_url && (
                <div
                  className="mb-6 h-16 w-16 overflow-hidden rounded-full border"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.85)' }}
                >
                  <Image src={gym.logo_url} alt={`${gym.name} logo`} width={64} height={64} className="h-full w-full object-cover" />
                </div>
              )}

              <h1
                className="text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl md:text-7xl"
                style={{ color: 'var(--color-white)', fontFamily: 'var(--font-heading)' }}
              >
                {gym.name}
              </h1>

              {gym.tagline && (
                <p className="mt-3 max-w-xl text-lg sm:text-xl md:text-2xl" style={{ color: 'var(--color-white)', opacity: 0.8 }}>
                  {gym.tagline}
                </p>
              )}

              <span
                className="mt-4 inline-flex rounded-full px-4 py-1.5 text-xs font-medium"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'var(--color-white)' }}
              >
                {gym.member_count} active members
              </span>

              <div className="mt-8">
                <Link href={`/signup/member?gym=${encodeURIComponent(gym.code)}`}>
                  <button
                    className="w-full max-w-[90vw] truncate rounded-full px-8 py-4 text-base font-semibold sm:w-auto sm:max-w-none sm:px-10"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }}
                  >
                    Join {gym.name}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {gym.description && (
        <section style={{ backgroundColor: 'var(--color-white)' }}>
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-24">
            <div className="grid gap-10 md:grid-cols-5">
              <div className="md:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
                  About
                </p>
                <h2
                  className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl"
                  style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
                >
                  Our Story
                </h2>
                <p className="mt-5 text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {gym.description}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
                  Contact
                </p>
                <div className="mt-5 space-y-4">
                  {gym.address && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {gym.address}
                      </p>
                    </div>
                  )}
                  {gym.phone && (
                    <div className="flex items-start gap-3">
                      <Phone size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {gym.phone}
                      </p>
                    </div>
                  )}
                  {!hasContact && (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Contact details will be available soon.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {hasAmenities && (
        <section style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
              What We Offer
            </p>
            <h2
              className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Amenities
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {gym.amenities?.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
                >
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--color-primary)' }} />
                  <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {gym.operating_hours && (
        <section style={{ backgroundColor: 'var(--color-white)' }}>
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
              Hours
            </p>
            <h2
              className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Open Every Day for Your Training
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-7">
              {DAY_ORDER.map((day) => {
                const hours = gym.operating_hours?.[day] || 'Closed';
                const isClosed = hours === 'Closed';
                const isToday = day === today;

                return (
                  <div
                    key={day}
                    className="rounded-2xl border p-5 text-center"
                    style={{
                      borderColor: isToday ? 'var(--color-primary)' : 'var(--color-surface)',
                      opacity: isClosed ? 0.5 : 1,
                    }}
                  >
                    <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
                      {day}
                    </p>
                    <p
                      className="mt-1 text-sm font-semibold"
                      style={{ color: isToday ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
                    >
                      {hours}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {gym.address && (
        <section style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
              Find Us
            </p>
            <h2
              className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Come Train With Us
            </h2>

            <p className="mt-6 text-lg sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>
              {gym.address}
            </p>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gym.address)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-base font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              Get directions -&gt;
            </a>

            <div className="mt-8 h-2 w-16 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
          </div>
        </section>
      )}

      {hasSocial && (
        <section style={{ backgroundColor: 'var(--color-white)' }}>
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
              Connect
            </p>
            <h2
              className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Stay Connected
            </h2>

            <div className="mt-8 flex flex-wrap gap-3">
              {gym.social_links?.facebook && (
                <a
                  href={gym.social_links.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[var(--color-surface)] bg-[var(--color-white)] px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:w-auto sm:px-8"
                  style={{ borderWidth: '1.5px' }}
                >
                  <Facebook size={18} /> Facebook
                </a>
              )}

              {gym.social_links?.instagram && (
                <a
                  href={gym.social_links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[var(--color-surface)] bg-[var(--color-white)] px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:w-auto sm:px-8"
                  style={{ borderWidth: '1.5px' }}
                >
                  <Instagram size={18} /> Instagram
                </a>
              )}

              {gym.social_links?.website && (
                <a
                  href={gym.social_links.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[var(--color-surface)] bg-[var(--color-white)] px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:w-auto sm:px-8"
                  style={{ borderWidth: '1.5px' }}
                >
                  <Globe size={18} /> Website
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="mx-auto max-w-5xl px-6 py-20 text-center md:px-16 md:py-28">
          <h2
            className="text-3xl font-bold sm:text-4xl md:text-5xl"
            style={{ color: 'var(--color-white)', fontFamily: 'var(--font-heading)' }}
          >
            Ready to start?
          </h2>
          <p className="mt-3 text-lg sm:text-xl" style={{ color: 'var(--color-white)', opacity: 0.8 }}>
            Join {gym.name} today.
          </p>

          <div className="mt-10">
            <Link href={`/signup/member?gym=${encodeURIComponent(gym.code)}`}>
              <button
                className="w-full max-w-[90vw] truncate rounded-full px-8 py-4 text-base font-semibold sm:w-auto sm:max-w-none sm:px-10"
                style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-primary)' }}
              >
                Join {gym.name}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function toOperatingHours(value: Json | null): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const source = value as Record<string, Json | undefined>;
  const output: Record<string, string> = {};

  for (const day of DAY_ORDER) {
    const raw = source[day];
    if (typeof raw === 'string') output[day] = raw;
  }

  return Object.keys(output).length > 0 ? output : null;
}

function toSocialLinks(value: Json | null): { facebook?: string; instagram?: string; website?: string } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const source = value as Record<string, Json | undefined>;

  const social: { facebook?: string; instagram?: string; website?: string } = {};
  if (typeof source.facebook === 'string' && source.facebook.trim()) social.facebook = source.facebook;
  if (typeof source.instagram === 'string' && source.instagram.trim()) social.instagram = source.instagram;
  if (typeof source.website === 'string' && source.website.trim()) social.website = source.website;

  return Object.keys(social).length > 0 ? social : null;
}

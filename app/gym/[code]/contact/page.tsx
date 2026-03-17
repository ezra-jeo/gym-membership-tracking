import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Phone, MapPin, Facebook, Instagram, Globe } from 'lucide-react';
import { getGymPublicByCode } from '@/lib/gym-public';
import { toTeamMembers } from '@/lib/gym-data';
import type { Json } from '@/lib/database.types';

type PageProps = { params: Promise<{ code: string }> | { code: string } };

export const revalidate = 86400;

export default async function ContactPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const { code, data } = await getGymPublicByCode(rawCode);
  if (!data || !data.is_published) notFound();

  const team = toTeamMembers(data.team_members as Json | null);
  const socialLinks = toSocialLinks(data.social_links as Json | null);
  const hasSocial = !!socialLinks && (!!socialLinks.facebook || !!socialLinks.instagram || !!socialLinks.website);

  return (
    <div>
      <section
        className="px-6 py-20 md:px-16 md:py-28"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
            Get in touch
          </p>
          <h1
            className="mt-3 text-4xl font-bold text-white sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Contact Us
          </h1>
        </div>
      </section>

      <section style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-20">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {data.phone && (
              <div className="flex items-start gap-4 rounded-2xl border p-6"
                style={{ borderColor: 'var(--color-surface)' }}>
                <Phone size={20} className="mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)' }}>Phone</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {data.phone}
                  </p>
                </div>
              </div>
            )}
            {data.address && (
              <div className="flex items-start gap-4 rounded-2xl border p-6"
                style={{ borderColor: 'var(--color-surface)' }}>
                <MapPin size={20} className="mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)' }}>Address</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {data.address}
                  </p>
                </div>
              </div>
            )}
            {hasSocial && (
              <div className="flex flex-col gap-2 rounded-2xl border p-6"
                style={{ borderColor: 'var(--color-surface)' }}>
                <p className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--color-text-muted)' }}>Follow Us</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {socialLinks?.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium"
                      style={{ color: 'var(--color-primary)' }}>
                      <Facebook size={14} /> Facebook
                    </a>
                  )}
                  {socialLinks?.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium"
                      style={{ color: 'var(--color-primary)' }}>
                      <Instagram size={14} /> Instagram
                    </a>
                  )}
                  {socialLinks?.website && (
                    <a href={socialLinks.website} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium"
                      style={{ color: 'var(--color-primary)' }}>
                      <Globe size={14} /> Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {team && team.length > 0 && (
        <section style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-16 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--color-primary)' }}>
              Our People
            </p>
            <h2
              className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Meet the Team
            </h2>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="overflow-hidden rounded-2xl border"
                  style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
                >
                  {member.photo_url ? (
                    <div className="relative h-56 w-full">
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex h-56 w-full items-center justify-center text-4xl font-bold"
                      style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="p-5">
                    <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {member.name}
                    </p>
                    <p className="mt-0.5 text-sm" style={{ color: 'var(--color-primary)' }}>
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="mx-auto max-w-5xl px-6 py-16 text-center md:px-16 md:py-20">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to join?</h2>
          <div className="mt-6">
            <Link href={`/signup/member?gym=${encodeURIComponent(code)}`}>
              <button
                className="rounded-full px-8 py-3 text-sm font-semibold"
                style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-primary)' }}
              >
                Join {data.name}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
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

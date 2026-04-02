import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGymPublicByCode } from '@/lib/gym-public';
import { GymSignUpForm } from '@/components/auth/GymSignUpForm';

export const revalidate = 86400;

type PageProps = {
  params: Promise<{ code: string }> | { code: string };
};

export default async function GymSignUpPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const { code, data: gym } = await getGymPublicByCode(rawCode);

  if (!gym || !gym.is_published) notFound();

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: 'var(--color-secondary)' }}>
      <div className="relative md:flex-1 h-[38vh] md:h-auto md:min-h-screen overflow-hidden">
        {gym.cover_url ? (
          <>
            <Image
              src={gym.cover_url}
              alt={gym.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.32), rgba(0,0,0,0.82))' }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(145deg, var(--color-secondary), var(--color-primary-dark), var(--color-primary))' }}
          />
        )}

        <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-12">
          {gym.logo_url && (
            <div className="mb-4 h-14 w-14 md:h-20 md:w-20 overflow-hidden rounded-full border-2 border-white/80">
              <Image
                src={gym.logo_url}
                alt={`${gym.name} logo`}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1
            className="text-3xl md:text-5xl font-bold leading-tight text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {gym.name}
          </h1>
          {gym.tagline && (
            <p className="mt-2 text-sm md:text-lg text-white/80 max-w-sm leading-relaxed">
              {gym.tagline}
            </p>
          )}
          <span
            className="mt-3 inline-flex self-start rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            {gym.member_count} active members
          </span>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-6 md:p-12"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94))' }}
      >
        <div className="w-full max-w-md">
          <Link
            href={`/gym/${encodeURIComponent(code)}`}
            className="inline-flex items-center gap-1 text-xs mb-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
            &larr; Back to {gym.name}
          </Link>

          <div className="mb-8">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: 'var(--color-secondary)' }}
            >
              New Member
            </p>
            <h2
              className="text-3xl font-bold"
              style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}
            >
              Join {gym.name}
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Create your member account. Your gym will approve you before you can log in.
            </p>
          </div>

          <div className="md:hidden flex justify-center mb-6">
            {gym.logo_url ? (
              <Image src={gym.logo_url} alt={`${gym.name} logo`} width={64} height={64} className="rounded-full object-cover" />
            ) : (
              <Image src="/stren-logo.png" alt="Stren Logo" width={64} height={64} className="object-contain" />
            )}
          </div>

          <GymSignUpForm gymCode={code} gymId={gym.id} gymName={gym.name} />

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link
              href={`/gym/${encodeURIComponent(code)}/login`}
              className="font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              Log in
            </Link>
          </p>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
            Stren Copyright 2026. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

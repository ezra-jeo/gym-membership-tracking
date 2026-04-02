import Link from 'next/link';
import { notFound } from 'next/navigation';
import { brandColorVars } from '@/lib/brand-color';
import { getGymPublicByCode } from '@/lib/gym-public';

export const revalidate = 86400;

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ code: string }> | { code: string };
};

type GymLayoutData = {
  name: string;
  code: string;
  brand_color: string | null;
  secondary_color?: string | null;
  is_published: boolean;
};

const NAV_LINKS = [
  { href: '', label: 'Home' },
  { href: '/contact', label: 'Contact' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/locate', label: 'Locate Us' },
] as const;

export default async function GymLayout({ children, params }: LayoutProps) {
  const { code: rawCode } = await params;
  const { data } = await getGymPublicByCode(rawCode);
  const gymData = data as GymLayoutData | null;
  const isPublished = !!gymData?.is_published;

  if (!gymData) notFound();

  return (
    <>
      <style>{`:root { ${brandColorVars(gymData.brand_color ?? '#D4956A', gymData.secondary_color ?? null)} }`}</style>

      {isPublished && (
        <nav
          className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-sm"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.25))' }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 md:px-16 md:py-3">
            <Link
              href={`/gym/${gymData.code}`}
              className="max-w-[40vw] truncate text-[11px] font-medium uppercase tracking-[0.18em] text-white/85 transition-opacity hover:text-white sm:text-xs md:max-w-none md:text-sm"
            >
              {gymData.name}
            </Link>

            <div className="hidden items-center gap-1 sm:flex">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={`/gym/${gymData.code}${href}`}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white md:text-sm"
                >
                  {label}
                </Link>
              ))}
            </div>

            <Link href={`/gym/${encodeURIComponent(gymData.code)}/signup`}>
              <button
                className="rounded-full px-4 py-1.5 text-xs font-semibold sm:px-5 sm:py-2 md:text-sm"
                style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-white)' }}
              >
                Join
              </button>
            </Link>
          </div>
        </nav>
      )}

      <main>{children}</main>

      <Link
        href="/landing"
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 text-xs text-white/50 transition-colors hover:text-white/80"
      >
        Powered by Stren
      </Link>
    </>
  );
}

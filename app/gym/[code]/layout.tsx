import Link from 'next/link';

export default function GymLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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

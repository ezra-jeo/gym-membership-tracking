import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0D0D0D]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/hero-gym.jpg"
          alt="Modern gym interior with warm lighting"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/60 via-transparent to-[#0D0D0D]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-20 pt-32 lg:px-8 lg:pb-28">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B1A]">
            Fitness Gym Management
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-[#FAFAFA] md:text-7xl lg:text-8xl">
            <span className="text-balance">
              Discover what{"'"}s possible at{" "}
              <span className="text-[#FF6B1A]">Curve Rush</span>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#FAFAFA]/70 md:text-xl">
            Track members, payments, and attendance — all in one system.
            No notebooks, no spreadsheets, no hassle.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/kiosk"
              className="inline-flex items-center justify-center rounded-full bg-[#FF6B1A] px-8 py-4 text-base font-semibold text-[#FAFAFA] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,107,26,0.35)]"
            >
              Open Kiosk
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#FAFAFA]/20 px-8 py-4 text-base font-semibold text-[#FAFAFA] transition-all hover:border-[#FAFAFA]/50 hover:bg-[#FAFAFA]/5"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-[#FAFAFA]/30 p-1.5">
            <div className="h-2 w-1 animate-bounce rounded-full bg-[#FAFAFA]/60" />
          </div>
        </div>
      </div>
    </section>
  )
}

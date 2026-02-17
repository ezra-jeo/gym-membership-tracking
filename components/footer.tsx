import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[#ffffff08] bg-[#0D0D0D]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="Curve Rush Fitness Gym logo"
              width={36}
              height={36}
              className="rounded-full opacity-60"
            />
            <span className="text-sm font-medium text-[#FAFAFA]/40">
              Curve Rush Gym Management
            </span>
          </Link>
          <p className="text-sm text-[#FAFAFA]/30">
            {"© 2026 Curve Rush. Built for independent gyms."}
          </p>
        </div>
      </div>
    </footer>
  )
}

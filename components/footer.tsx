import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[#ffffff08] bg-[#0D0D0D]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4956A]/60">
              <span className="text-xs font-bold text-white">S</span>
            </div>
            <span className="text-sm font-medium text-[#FAFAFA]/40">
              Stren Gym Management
            </span>
          </Link>
          <p className="text-sm text-[#FAFAFA]/30">
            {"© 2026 Stren. Built for independent gyms."}
          </p>
        </div>
      </div>
    </footer>
  )
}

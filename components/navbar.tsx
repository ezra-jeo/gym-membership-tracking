"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#ffffff10]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Curve Rush Fitness Gym logo"
            width={48}
            height={48}
            className="rounded-full"
          />
          <span className="font-display text-lg font-bold tracking-tight text-[#FAFAFA]">
            Curve Rush
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-10 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium tracking-wide text-[#FAFAFA]/70 uppercase transition-colors hover:text-[#FF6B1A]"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium tracking-wide text-[#FAFAFA]/70 uppercase transition-colors hover:text-[#FF6B1A]"
          >
            How It Works
          </Link>
          <Link
            href="#why-us"
            className="text-sm font-medium tracking-wide text-[#FAFAFA]/70 uppercase transition-colors hover:text-[#FF6B1A]"
          >
            Why Us
          </Link>
          <Link
            href="/kiosk"
            className="rounded-full border-2 border-[#FF6B1A]/40 px-5 py-2.5 text-sm font-semibold text-[#FAFAFA] transition-all hover:-translate-y-0.5 hover:border-[#FF6B1A] hover:bg-[#FF6B1A]/10"
          >
            Kiosk
          </Link>
          <Link
            href="/admin"
            className="rounded-full border-2 border-[#FF6B1A] bg-[#FF6B1A] px-5 py-2.5 text-sm font-semibold text-[#FAFAFA] transition-all hover:-translate-y-0.5 hover:bg-transparent hover:text-[#FF6B1A]"
          >
            Admin
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#FAFAFA] md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-[#ffffff10] bg-[#0D0D0D]/98 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 px-6 py-6">
            <Link
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium tracking-wide text-[#FAFAFA]/70 uppercase transition-colors hover:bg-[#ffffff08] hover:text-[#FF6B1A]"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium tracking-wide text-[#FAFAFA]/70 uppercase transition-colors hover:bg-[#ffffff08] hover:text-[#FF6B1A]"
            >
              How It Works
            </Link>
            <Link
              href="#why-us"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium tracking-wide text-[#FAFAFA]/70 uppercase transition-colors hover:bg-[#ffffff08] hover:text-[#FF6B1A]"
            >
              Why Us
            </Link>
            <Link
              href="/kiosk"
              onClick={() => setMobileOpen(false)}
              className="mt-3 rounded-full border-2 border-[#FF6B1A]/40 px-6 py-3 text-center text-sm font-semibold text-[#FAFAFA] transition-all hover:border-[#FF6B1A] hover:bg-[#FF6B1A]/10"
            >
              Kiosk
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full border-2 border-[#FF6B1A] bg-[#FF6B1A] px-6 py-3 text-center text-sm font-semibold text-[#FAFAFA] transition-all hover:bg-transparent hover:text-[#FF6B1A]"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

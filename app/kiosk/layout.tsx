"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { QrCode, RefreshCw, Shield } from "lucide-react"

const NAV = [
  { href: "/kiosk",       label: "Check In / Out", icon: QrCode },
  { href: "/kiosk/renew", label: "Renew",           icon: RefreshCw },
]

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--color-charcoal)", color: "var(--color-white)" }}>
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <Link href="/kiosk" className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-white)" }}
          >
            S
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Stren
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? "rgba(212,149,106,0.2)" : "transparent",
                  color: isActive ? "var(--color-primary)" : "rgba(255,255,255,0.7)",
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ml-2"
            style={{
              borderColor: "rgba(212,149,106,0.4)",
              color: "var(--color-primary)",
            }}
          >
            <Shield size={16} />
            Admin
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
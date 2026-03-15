"use client"

import React from "react"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function KioskLayout({ children }: { children: React.ReactNode }) {
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
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Stren Kiosk
          </span>
        </Link>
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
          style={{ borderColor: "rgba(212,149,106,0.4)", color: "var(--color-primary)" }}
        >
          <Shield size={16} />
          Admin
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
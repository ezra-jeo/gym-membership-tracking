import React from "react"
import Link from "next/link"
import Image from "next/image"

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-foreground text-primary-foreground">
      <header className="flex items-center justify-between border-b border-muted-foreground/20 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/assets/logo.png"
            alt="Curve Rush"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="font-display text-lg font-bold tracking-tight">
            Curve Rush
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/kiosk"
            className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-primary/20 hover:text-primary"
          >
            Check In / Out
          </Link>
          <Link
            href="/kiosk/signup"
            className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-primary/20 hover:text-primary"
          >
            New Member
          </Link>
          <Link
            href="/kiosk/renew"
            className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-primary/20 hover:text-primary"
          >
            Renew
          </Link>
          <Link
            href="/admin"
            className="rounded-md border border-primary/40 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Admin
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}

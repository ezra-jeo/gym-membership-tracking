import React from "react"
import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { GymProvider } from '@/lib/gym-context'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Curve Rush Fitness Gym',
  description:
    'Modern gym management for growing gyms. Track members, payments, and attendance all in one system.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <GymProvider>
          {children}
          <Toaster />
        </GymProvider>
      </body>
    </html>
  )
}

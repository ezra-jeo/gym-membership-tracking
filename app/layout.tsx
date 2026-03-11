import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Stren',
  description: 'Gym Membership Tracking',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/stren-logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/stren-logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/stren-logo.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/stren-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

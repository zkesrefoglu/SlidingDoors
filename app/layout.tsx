import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sesler',
  description: 'A private space for shared moments',
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream antialiased">
        <div className="fixed inset-0 paper-texture" aria-hidden="true" />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  )
}

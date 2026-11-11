import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { preload } from 'react-dom'
import './globals.css'

export const metadata: Metadata = {
  title: 'Studio Preview',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  preload('/assets/fonts/BaiJamjuree-Regular.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  preload('/assets/fonts/BaiJamjuree-SemiBold.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

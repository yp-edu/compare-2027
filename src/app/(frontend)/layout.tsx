import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { PwaProvider } from '@/components/pwa/pwa-provider'
import { defaultOpenGraphImage, siteDescription, siteMetadataBase, siteName } from '@/lib/seo'

import './styles.css'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  applicationName: siteName,
  category: 'politics',
  description: siteDescription,
  metadataBase: siteMetadataBase,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [{ sizes: '192x192', url: '/icons/icon-192.png' }],
    icon: [
      { sizes: '192x192', type: 'image/png', url: '/icons/icon-192.png' },
      { sizes: '512x512', type: 'image/png', url: '/icons/icon-512.png' },
    ],
    shortcut: [{ type: 'image/webp', url: '/c27.webp' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    description: siteDescription,
    images: defaultOpenGraphImage,
    locale: 'fr_FR',
    siteName,
    title: siteName,
    type: 'website',
    url: '/',
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    index: true,
  },
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  twitter: {
    card: 'summary',
    description: siteDescription,
    images: ['/icons/icon-512.png'],
    title: siteName,
  },
}

export const viewport: Viewport = {
  themeColor: '#12305f',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <PwaProvider>{children}</PwaProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

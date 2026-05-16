import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { PwaProvider } from '@/components/pwa/pwa-provider'

import './styles.css'

export const metadata: Metadata = {
  applicationName: 'Compare 2027',
  metadataBase: new URL('https://compare2027.fr'),
  description:
    'Compare 2027 aide à comparer les programmes, positions et partis politiques pour la prochaine élection présidentielle.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Compare 2027',
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
    description:
      'Un outil impartial pour comparer les programmes, positions publiques et partis politiques en vue de 2027.',
    images: [
      {
        alt: 'Logo Compare 2027',
        height: 512,
        url: '/icons/icon-512.png',
        width: 512,
      },
    ],
    siteName: 'Compare 2027',
    title: 'Compare 2027',
    type: 'website',
    url: '/',
  },
  title: 'Compare 2027',
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

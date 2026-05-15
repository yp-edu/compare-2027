import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'

import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://compare-2027.vercel.app'),
  description:
    'Compare 2027 aide à comparer les programmes, positions et partis politiques pour la prochaine élection présidentielle.',
  openGraph: {
    description:
      'Un outil impartial pour comparer les programmes, positions publiques et partis politiques en vue de 2027.',
    siteName: 'Compare 2027',
    title: 'Compare 2027',
    type: 'website',
    url: '/',
  },
  title: 'Compare 2027',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

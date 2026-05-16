import type { Metadata } from 'next'

export const siteName = 'Compare 2027'
export const siteUrl = 'https://compare2027.fr'
export const siteMetadataBase = new URL(siteUrl)
export const siteDescription =
  'Compare 2027 aide à comparer les programmes, positions publiques, candidats et partis politiques pour la prochaine élection présidentielle.'

export const defaultOpenGraphImage = [
  {
    alt: 'Logo Compare 2027',
    height: 512,
    url: '/icons/icon-512.png',
    width: 512,
  },
]

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString()
}

export function createPageMetadata({
  description = siteDescription,
  noIndex = false,
  path,
  title,
}: {
  description?: string
  noIndex?: boolean
  path: string
  title: string
}): Metadata {
  const pageUrl = absoluteUrl(path)

  return {
    alternates: {
      canonical: path,
    },
    description,
    openGraph: {
      description,
      images: defaultOpenGraphImage,
      locale: 'fr_FR',
      siteName,
      title,
      type: 'website',
      url: pageUrl,
    },
    robots: noIndex
      ? {
          follow: false,
          googleBot: {
            follow: false,
            index: false,
          },
          index: false,
        }
      : {
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
    title,
    twitter: {
      card: 'summary',
      description,
      images: ['/icons/icon-512.png'],
      title,
    },
  }
}

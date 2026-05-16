import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: ['/', '/llms.txt', '/manifest.webmanifest', '/icons/', '/c27.webp'],
      disallow: [
        '/admin/',
        '/api/',
        '/signin',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/consent',
        '/offline',
      ],
      userAgent: '*',
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}

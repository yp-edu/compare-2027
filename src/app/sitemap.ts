import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/seo'

const sitemapRoutes = [
  { changeFrequency: 'weekly', path: '/', priority: 1 },
  { changeFrequency: 'weekly', path: '/compare', priority: 0.9 },
  { changeFrequency: 'monthly', path: '/neutralite', priority: 0.7 },
  { changeFrequency: 'yearly', path: '/cgu', priority: 0.4 },
  { changeFrequency: 'yearly', path: '/confidentialite', priority: 0.4 },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return sitemapRoutes.map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified,
    priority: route.priority,
    url: absoluteUrl(route.path),
  }))
}

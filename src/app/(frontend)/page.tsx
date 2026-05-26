import { ComparisonPreview } from '@/components/landing/comparison-preview'
import { HeroSection } from '@/components/landing/hero-section'
import { MethodologySection } from '@/components/landing/methodology-section'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { CandidateCorpusPreview } from '@/features/candidates/components/candidate-corpus-preview'
import { absoluteUrl, createPageMetadata, siteDescription, siteName, siteUrl } from '@/lib/seo'

export const metadata = createPageMetadata({
  description: siteDescription,
  path: '/',
  title: 'Comparateur politique partial pour 2027',
})

export default function HomePage() {
  const comparisonTopics = [
    'Pouvoir d’achat',
    'Éducation',
    'Santé',
    'Écologie',
    'Institutions',
    'Europe',
  ]
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${siteUrl}/#website`,
        '@type': 'WebSite',
        description: siteDescription,
        inLanguage: 'fr-FR',
        name: siteName,
        url: siteUrl,
      },
      {
        '@id': `${siteUrl}/#organization`,
        '@type': 'Organization',
        logo: absoluteUrl('/icons/icon-512.png'),
        name: siteName,
        url: siteUrl,
      },
      {
        '@id': `${siteUrl}/#application`,
        '@type': 'WebApplication',
        applicationCategory: 'EducationalApplication',
        description:
          'Application web de comparaison politique en français fondée sur des programmes, propositions, positions publiques et sources identifiées.',
        inLanguage: 'fr-FR',
        name: siteName,
        operatingSystem: 'Web',
        url: absoluteUrl('/compare'),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader />
      <main>
        <HeroSection topics={comparisonTopics} />
        <CandidateCorpusPreview />
        <ComparisonPreview />
        <MethodologySection />
      </main>
      <SiteFooter />
    </div>
  )
}

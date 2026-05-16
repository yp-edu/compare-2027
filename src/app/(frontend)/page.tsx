import { CandidateCorpusPreview } from '@/components/landing/candidate-corpus-preview'
import { ComparisonPreview } from '@/components/landing/comparison-preview'
import { HeroSection } from '@/components/landing/hero-section'
import { MethodologySection } from '@/components/landing/methodology-section'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

export default function HomePage() {
  const comparisonTopics = [
    'Pouvoir d’achat',
    'Éducation',
    'Santé',
    'Écologie',
    'Institutions',
    'Europe',
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
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

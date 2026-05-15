import { ComparisonPreview } from '@/components/comparison-preview'
import { HeroSection } from '@/components/hero-section'
import { MethodologySection } from '@/components/methodology-section'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

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
        <ComparisonPreview />
        <MethodologySection />
      </main>
      <SiteFooter />
    </div>
  )
}

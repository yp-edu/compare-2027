import { CompareChat } from '@/components/compare/compare-chat'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { compareResponseFeedback } from '@/flags'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  description:
    'Posez une question politique en français et obtenez une comparaison structurée entre programmes, candidats, partis, propositions et positions publiques.',
  path: '/compare',
  title: 'Comparateur conversationnel politique',
})

export default async function ComparePage() {
  const feedbackEnabled = await compareResponseFeedback()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="px-5 py-6 sm:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <CompareChat feedbackEnabled={feedbackEnabled} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

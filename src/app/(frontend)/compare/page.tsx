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
      <main className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">
              Comparateur conversationnel
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
              Posez une question politique. Obtenez une comparaison lisible.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Le chat s’appuie sur les contenus éditoriaux de Compare 2027 et doit signaler les
              sources, les divergences et les manques de données.
            </p>
          </div>
          <CompareChat feedbackEnabled={feedbackEnabled} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

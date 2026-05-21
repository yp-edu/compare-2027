import { getPayload } from 'payload'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { SubmissionForms } from '@/features/submissions/components/submission-forms'
import { createPageMetadata } from '@/lib/seo'
import config from '@/payload.config'

export const metadata = createPageMetadata({
  description:
    'Proposez une source politique ou signalez une déclaration de candidature pour Compare 2027.',
  path: '/contribuer',
  title: 'Contribuer des sources',
})

export default async function ContributePage() {
  const payload = await getPayload({ config })
  const candidates = await payload.find({
    collection: 'candidates',
    depth: 0,
    limit: 100,
    sort: 'sortOrder',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">
              Sources citoyennes
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
              Aidez à garder Compare 2027 à jour.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Les liens proposés sont analysés automatiquement puis vérifiés avant d’alimenter les
              réponses du comparateur.
            </p>
          </div>
          <SubmissionForms
            candidates={candidates.docs.map((candidate) => ({
              displayName: candidate.displayName,
              id: candidate.id,
            }))}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

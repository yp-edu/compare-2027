'use client'

import useSWR from 'swr'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Candidate, Party } from '@/payload-types'

type CandidatesResponse = {
  docs: Candidate[]
  totalDocs: number
}

const candidatesEndpoint = '/api/candidates?depth=1&limit=100&sort=sortOrder'
const fallbackColor = '#64748B'
const loadingCards = Array.from({ length: 8 }, (_, index) => index)

async function fetchCandidates(url: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to load candidates')
  }

  return response.json() as Promise<CandidatesResponse>
}

function getParty(candidate: Candidate): Party | null {
  return candidate.currentParty && typeof candidate.currentParty === 'object'
    ? candidate.currentParty
    : null
}

function getHexColor(color?: null | string) {
  return color && /^#[\dA-F]{6}$/i.test(color) ? color : fallbackColor
}

function getCandidateSummary(candidate: Candidate, party: Party | null) {
  if (candidate.bio) {
    return candidate.bio
  }

  if (party) {
    return `${candidate.displayName} est relié à ${party.name} dans le corpus public.`
  }

  return 'Fiche publique disponible pour alimenter les comparaisons.'
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const party = getParty(candidate)
  const partyColor = getHexColor(party?.color)

  return (
    <Card
      className="overflow-hidden bg-card/85 backdrop-blur"
      style={{ borderColor: `${partyColor}66` }}
    >
      <div className="h-2" style={{ backgroundColor: partyColor }} />
      <CardHeader>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            #{(candidate.sortOrder || 0).toString().padStart(2, '0')}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-black"
            style={{ backgroundColor: `${partyColor}18`, color: partyColor }}
          >
            {party?.shortName || 'Sans parti'}
          </span>
        </div>
        <CardTitle className="text-2xl leading-tight">{candidate.displayName}</CardTitle>
        <CardDescription>{party?.name || 'Parti ou mouvement non renseigné'}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          {getCandidateSummary(candidate, party)}
        </p>
      </CardContent>
    </Card>
  )
}

function CandidateCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-card/85 backdrop-blur">
      <div className="h-2 bg-muted" />
      <CardHeader>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="h-3 w-14 rounded-full bg-muted" />
          <div className="h-6 w-16 rounded-full bg-muted" />
        </div>
        <div className="h-7 w-40 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-3 rounded bg-muted" />
          <div className="h-3 w-4/5 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CandidateCorpusPreview() {
  const { data, error, isLoading } = useSWR<CandidatesResponse>(
    candidatesEndpoint,
    fetchCandidates,
    {
      revalidateOnFocus: false,
    },
  )
  const candidates = data?.docs || []

  return (
    <section className="px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <Badge variant="secondary">Corpus public</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Les candidats référencés pour commencer à comparer.
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            La liste se met à jour à partir des contenus publics : candidats, partis ou mouvements,
            et sources associées.
          </p>
        </div>

        {error ? (
          <Card className="bg-card/85 backdrop-blur">
            <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
              Impossible de charger les candidats pour le moment. Réessayez plus tard.
            </CardContent>
          </Card>
        ) : null}

        {!error && isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loadingCards.map((index) => (
              <CandidateCardSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {!error && !isLoading && candidates.length === 0 ? (
          <Card className="bg-card/85 backdrop-blur">
            <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
              Aucun candidat public n’est disponible pour le moment.
            </CardContent>
          </Card>
        ) : null}

        {!error && candidates.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {candidates.map((candidate) => (
              <CandidateCard candidate={candidate} key={candidate.id} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

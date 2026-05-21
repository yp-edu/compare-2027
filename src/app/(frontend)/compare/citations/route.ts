import { getPayload } from 'payload'

import { requireChatSession } from '@/features/ai/server'
import config from '@/payload.config'

const maxCitationIds = 20

type SourceReference = {
  canonicalUrl?: null | string
  isPrimary?: boolean | null
  label?: null | string
  url?: null | string
}

type CitationSourceDoc = {
  id: number
  platform?: null | string
  publishedAt?: null | string
  references?: null | SourceReference[]
  slug?: null | string
  title?: null | string
  verificationStatus?: null | string
}

type CitationActorDoc = {
  color?: null | string
  currentParty?: CitationActorDoc | number | string | null
  displayName?: null | string
  name?: null | string
  shortName?: null | string
}

type CitationActorRelation = {
  relationTo?: string
  value?: CitationActorDoc | number | string | null
} | null

type CitationActorMetadata = {
  color: null | string
  name: null | string
  type: null | string
}

type CitationClaimDoc = {
  actor?: CitationActorRelation
  claimText?: null | string
  evidenceQuote?: null | string
  id: number
  positionDate?: null | string
  primarySource?: CitationSourceDoc | number | string | null
  title?: null | string
}

type CitationEvidenceDoc = {
  quote?: null | string
  source?: CitationSourceDoc | number | string | null
  sourceUrl?: null | string
}

type CitationProgramDoc = {
  actor?: CitationActorRelation
  sources?: Array<{
    source?: CitationSourceDoc | number | string | null
  }> | null
}

function getIds(searchParams: URLSearchParams, name: string) {
  return Array.from(
    new Set(
      (searchParams.get(name) || '')
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ).slice(0, maxCitationIds)
}

function getPrimaryReference(source: CitationSourceDoc | null | undefined) {
  const references = source?.references || []
  return (
    references.find((reference) => reference.isPrimary && reference.url) ||
    references.find((reference) => reference.url)
  )
}

function getSourceUrl(source: CitationSourceDoc | null | undefined) {
  const reference = getPrimaryReference(source)

  return reference?.canonicalUrl || reference?.url || null
}

function getSourceLabel(source: CitationSourceDoc | null | undefined) {
  const reference = getPrimaryReference(source)

  return source?.title || reference?.label || 'Source'
}

function getActorName(actor: CitationActorRelation | undefined) {
  const value = actor?.value

  if (!value || typeof value !== 'object') {
    return typeof value === 'string' || typeof value === 'number' ? String(value) : null
  }

  return value.displayName || value.name || value.shortName || null
}

function getActorColor(actor: CitationActorRelation | undefined) {
  const value = actor?.value

  if (!value || typeof value !== 'object') {
    return null
  }

  if (typeof value.color === 'string') {
    return value.color
  }

  const currentParty = value.currentParty

  if (currentParty && typeof currentParty === 'object' && typeof currentParty.color === 'string') {
    return currentParty.color
  }

  return null
}

function getActorMetadata(actor: CitationActorRelation | undefined): CitationActorMetadata | null {
  if (!actor) {
    return null
  }

  return {
    color: getActorColor(actor),
    name: getActorName(actor),
    type: actor.relationTo || null,
  }
}

function toSourceCitation(
  source: CitationSourceDoc | null | undefined,
  actor?: CitationActorMetadata | null,
) {
  if (!source) {
    return null
  }

  return {
    actor: actor || null,
    id: source.id,
    platform: source.platform || null,
    publishedAt: source.publishedAt || null,
    slug: source.slug || null,
    title: getSourceLabel(source),
    url: getSourceUrl(source),
    verificationStatus: source.verificationStatus || null,
  }
}

function getSourceDoc(value: CitationSourceDoc | number | string | null | undefined) {
  return value && typeof value === 'object' ? value : null
}

function getRelationId(value: CitationSourceDoc | number | string | null | undefined) {
  if (!value) {
    return null
  }

  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const id = Number(value)

    return Number.isInteger(id) && id > 0 ? id : null
  }

  return value.id
}

function getProgramActorsBySource(programs: CitationProgramDoc[]) {
  const actorsBySource = new Map<number, CitationActorMetadata>()

  for (const program of programs) {
    const actor = getActorMetadata(program.actor)

    if (!actor) {
      continue
    }

    for (const entry of program.sources || []) {
      const sourceId = getRelationId(entry.source)

      if (sourceId && !actorsBySource.has(sourceId)) {
        actorsBySource.set(sourceId, actor)
      }
    }
  }

  return actorsBySource
}

export async function GET(request: Request) {
  const session = await requireChatSession(request)

  if (!session) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const url = new URL(request.url)
  const claimIds = getIds(url.searchParams, 'claims')
  const sourceIds = getIds(url.searchParams, 'sources')

  if (claimIds.length === 0 && sourceIds.length === 0) {
    return Response.json({ claims: [], sources: [] })
  }

  const payload = await getPayload({ config })
  const publishedOnly = { _status: { equals: 'published' } } as const
  const claimsResult = claimIds.length
    ? await payload.find({
        collection: 'claims',
        depth: 3,
        limit: claimIds.length,
        where: {
          and: [publishedOnly, { id: { in: claimIds } }, { reviewStatus: { equals: 'reviewed' } }],
        },
      })
    : { docs: [] }
  const directSourcesResult = sourceIds.length
    ? await payload.find({
        collection: 'sources',
        depth: 0,
        limit: sourceIds.length,
        where: {
          and: [publishedOnly, { id: { in: sourceIds } }],
        },
      })
    : { docs: [] }
  const sourceProgramsResult = sourceIds.length
    ? await payload.find({
        collection: 'programs',
        depth: 3,
        limit: maxCitationIds * 5,
        where: {
          and: [publishedOnly, { 'sources.source': { in: sourceIds } }],
        },
      })
    : { docs: [] }
  const programActorsBySource = getProgramActorsBySource(
    sourceProgramsResult.docs as CitationProgramDoc[],
  )

  const claims = await Promise.all(
    claimsResult.docs.map(async (claim) => {
      const typedClaim = claim as CitationClaimDoc
      const evidenceResult = await payload.find({
        collection: 'claim-evidence',
        depth: 2,
        limit: 1,
        sort: '-updatedAt',
        where: {
          and: [
            publishedOnly,
            { claim: { equals: typedClaim.id } },
            { reviewStatus: { equals: 'reviewed' } },
          ],
        },
      })
      const evidence = evidenceResult.docs[0] as CitationEvidenceDoc | undefined
      const evidenceSource = getSourceDoc(evidence?.source)
      const primarySource = getSourceDoc(typedClaim.primarySource)

      return {
        actor: {
          color: getActorColor(typedClaim.actor),
          name: getActorName(typedClaim.actor),
          type: typedClaim.actor?.relationTo || null,
        },
        claimText: typedClaim.claimText || null,
        evidenceQuote: evidence?.quote || typedClaim.evidenceQuote || null,
        id: typedClaim.id,
        positionDate: typedClaim.positionDate || null,
        source: toSourceCitation(evidenceSource || primarySource),
        sourceUrl: evidence?.sourceUrl || getSourceUrl(evidenceSource || primarySource),
        title: typedClaim.title || null,
      }
    }),
  )
  const sources = directSourcesResult.docs
    .map((source) => {
      const typedSource = source as CitationSourceDoc

      return toSourceCitation(typedSource, programActorsBySource.get(typedSource.id))
    })
    .filter(Boolean)

  return Response.json({ claims, sources })
}

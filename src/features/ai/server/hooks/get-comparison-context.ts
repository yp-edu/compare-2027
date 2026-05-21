import { getPayload } from 'payload'

import config from '@/payload.config'

type NamedValue = {
  displayName?: string | null
  id?: number | string
  name?: string | null
  references?: SourceReference[] | null
  slug?: string | null
  sources?: ProgramSource[] | null
  shortName?: string | null
  title?: string | null
}

type SourceReference = {
  isPrimary?: boolean | null
  label?: string | null
  url?: string | null
}

type ProgramSource = {
  role?: string | null
  source?: NamedValue | number | string | null
}

type PolymorphicRelation = {
  relationTo?: string
  value?: NamedValue | number | string | null
}

function getNamedValue(value: unknown) {
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' || typeof value === 'number' ? String(value) : 'Non renseigné'
  }

  const named = value as NamedValue

  return named.displayName || named.name || named.shortName || named.title || 'Non renseigné'
}

function getActorName(actor: unknown) {
  if (!actor || typeof actor !== 'object') {
    return getNamedValue(actor)
  }

  const relation = actor as PolymorphicRelation

  return getNamedValue(relation.value ?? actor)
}

function getTopicNames(topics: unknown) {
  if (!Array.isArray(topics)) {
    return 'Sans thème'
  }

  return topics.map(getNamedValue).join(', ') || 'Sans thème'
}

function getSourceReference(source: unknown) {
  if (!source || typeof source !== 'object') {
    return getNamedValue(source)
  }

  const named = source as NamedValue
  const title = getNamedValue(source)
  const sourceId = named.id ? `source:${named.id} ` : ''
  const primaryReference = (named.references || []).find((reference) => reference.isPrimary)
  const fallbackReference = (named.references || []).find((reference) => reference.url)
  const url = primaryReference?.url || fallbackReference?.url

  return url ? `${sourceId}${title} (${url})` : `${sourceId}${title}`
}

function getProgramSources(program: NamedValue) {
  if (!Array.isArray(program.sources) || program.sources.length === 0) {
    return 'sources non renseignées'
  }

  return program.sources
    .map((entry) => `${getSourceReference(entry.source)}${entry.role ? ` [${entry.role}]` : ''}`)
    .join('; ')
}

export async function getComparisonContext() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const publishedOnly = { _status: { equals: 'published' } } as const

  const [topics, candidates, parties, claims, proposals, positions, programs] = await Promise.all([
    payload.find({
      collection: 'topics',
      depth: 0,
      limit: 20,
      sort: 'order',
      where: publishedOnly,
    }),
    payload.find({
      collection: 'candidates',
      depth: 1,
      limit: 20,
      sort: 'sortOrder',
      where: publishedOnly,
    }),
    payload.find({
      collection: 'parties',
      depth: 0,
      limit: 20,
      sort: 'name',
      where: publishedOnly,
    }),
    payload.find({
      collection: 'claims',
      depth: 2,
      limit: 50,
      sort: '-positionDate',
      where: {
        and: [
          publishedOnly,
          {
            reviewStatus: {
              equals: 'reviewed',
            },
          },
        ],
      },
    }),
    payload.find({
      collection: 'proposals',
      depth: 1,
      limit: 25,
      sort: '-updatedAt',
      where: publishedOnly,
    }),
    payload.find({
      collection: 'public-positions',
      depth: 1,
      limit: 25,
      sort: '-positionDate',
      where: publishedOnly,
    }),
    payload.find({
      collection: 'programs',
      depth: 1,
      limit: 15,
      sort: '-programDate',
      where: publishedOnly,
    }),
  ])

  const topicLines = topics.docs.map(
    (topic) => `- ${topic.title}: ${topic.description || 'Pas de description'}`,
  )
  const candidateLines = candidates.docs.map(
    (candidate) =>
      `- ${candidate.displayName}: statut ${candidate.candidacyStatus}; ${candidate.bio || 'pas de bio'}`,
  )
  const partyLines = parties.docs.map(
    (party) =>
      `- ${party.name}${party.shortName ? ` (${party.shortName})` : ''}: ${party.description || 'pas de description'}`,
  )
  const claimLines = claims.docs.map(
    (claim) =>
      `- [claim:${claim.id}] ${claim.title} | acteur: ${getActorName(claim.actor)} | thèmes: ${getTopicNames(claim.topics)} | type: ${claim.claimType} | position: ${claim.stance} | date: ${claim.positionDate || 'non datée'} | affirmation: ${claim.claimText} | source: ${getSourceReference(claim.primarySource)}${claim.evidenceQuote ? ` | citation: ${claim.evidenceQuote}` : ''}`,
  )
  const proposalLines = proposals.docs.map(
    (proposal) =>
      `- ${proposal.title} | acteur: ${getActorName(proposal.actor)} | thèmes: ${getTopicNames(proposal.topics)} | résumé: ${proposal.summary}`,
  )
  const positionLines = positions.docs.map(
    (position) =>
      `- ${position.title} | acteur: ${getActorName(position.actor)} | position: ${position.stance} | thèmes: ${getTopicNames(position.topics)} | résumé: ${position.summary}`,
  )
  const programLines = programs.docs.map(
    (program) =>
      `- ${program.title} | acteur: ${getActorName(program.actor)} | date: ${program.programDate || 'non datée'} | résumé: ${program.summary || 'pas de résumé'} | sources: ${getProgramSources(program)}`,
  )

  return [
    'THÈMES PUBLIÉS',
    topicLines.join('\n') || '- Aucun thème publié',
    'CANDIDATS PUBLIÉS',
    candidateLines.join('\n') || '- Aucun candidat publié',
    'PARTIS PUBLIÉS',
    partyLines.join('\n') || '- Aucun parti publié',
    'CLAIMS REVUES PUBLIÉES',
    claimLines.join('\n') || '- Aucune claim revue publiée',
    'PROPOSITIONS PUBLIÉES',
    proposalLines.join('\n') || '- Aucune proposition publiée',
    'POSITIONS PUBLIQUES PUBLIÉES',
    positionLines.join('\n') || '- Aucune position publique publiée',
    'PROGRAMMES PUBLIÉS',
    programLines.join('\n') || '- Aucun programme publié',
  ].join('\n\n')
}

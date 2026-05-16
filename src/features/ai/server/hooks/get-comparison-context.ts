import { getPayload } from 'payload'

import config from '@/payload.config'

type NamedValue = {
  displayName?: string | null
  name?: string | null
  shortName?: string | null
  title?: string | null
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

export async function getComparisonContext() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const publishedOnly = { _status: { equals: 'published' } } as const

  const [topics, candidates, parties, proposals, positions, programs] = await Promise.all([
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
      `- ${program.title} | acteur: ${getActorName(program.actor)} | date: ${program.programDate || 'non datée'} | résumé: ${program.summary || 'pas de résumé'}`,
  )

  return [
    'THÈMES PUBLIÉS',
    topicLines.join('\n') || '- Aucun thème publié',
    'CANDIDATS PUBLIÉS',
    candidateLines.join('\n') || '- Aucun candidat publié',
    'PARTIS PUBLIÉS',
    partyLines.join('\n') || '- Aucun parti publié',
    'PROPOSITIONS PUBLIÉES',
    proposalLines.join('\n') || '- Aucune proposition publiée',
    'POSITIONS PUBLIQUES PUBLIÉES',
    positionLines.join('\n') || '- Aucune position publique publiée',
    'PROGRAMMES PUBLIÉS',
    programLines.join('\n') || '- Aucun programme publié',
  ].join('\n\n')
}

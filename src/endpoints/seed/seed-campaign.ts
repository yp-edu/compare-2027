import type { BasePayload } from 'payload'

import {
  campaignCandidates,
  campaignParties,
  campaignPrograms,
  campaignSources,
  type CampaignCandidateSeed,
  type CampaignPartySeed,
  type CampaignProgramSeed,
  type CampaignSourceSeed,
} from '@/scripts/campaign-2027'

type SeedData = Record<string, unknown>

type CampaignTopicSeed = {
  color?: string
  description?: string
  order: number
  slug: string
  title: string
}

const seedRetrievedAt = '2026-05-21T00:00:00.000Z'

const campaignTopics: CampaignTopicSeed[] = [
  {
    color: '#2563eb',
    description: 'Institutions, démocratie, libertés publiques et organisation de l’État.',
    order: 10,
    slug: 'institutions-democratie',
    title: 'Institutions et démocratie',
  },
  {
    color: '#16a34a',
    description: 'Climat, biodiversité, énergie, agriculture et planification écologique.',
    order: 20,
    slug: 'ecologie-energie',
    title: 'Écologie et énergie',
  },
  {
    color: '#dc2626',
    description: 'Travail, salaires, fiscalité, entreprises, industrie et pouvoir d’achat.',
    order: 30,
    slug: 'economie-travail',
    title: 'Économie et travail',
  },
  {
    color: '#9333ea',
    description: 'Santé, éducation, protection sociale, logement et services publics.',
    order: 40,
    slug: 'solidarites-services-publics',
    title: 'Solidarités et services publics',
  },
  {
    color: '#ea580c',
    description: 'Europe, relations internationales, défense, paix et commerce mondial.',
    order: 50,
    slug: 'international-europe-defense',
    title: 'International, Europe et défense',
  },
]

function isSeedDataCurrent(doc: unknown, data: SeedData) {
  const record = doc as Record<string, unknown>

  return Object.entries(data).every(([key, expected]) => {
    const actual = record[key]

    if (Array.isArray(expected)) {
      const actualArray = Array.isArray(actual) ? actual : []

      return (
        actualArray.length === expected.length &&
        actualArray.every((value, index) => value === expected[index])
      )
    }

    return (actual ?? undefined) === expected
  })
}

async function upsertTopic(payload: BasePayload, topic: CampaignTopicSeed) {
  const existingTopic = await payload.find({
    collection: 'topics',
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: topic.slug,
      },
    },
  })

  const data = {
    color: topic.color,
    description: topic.description,
    order: topic.order,
    slug: topic.slug,
    title: topic.title,
    _status: 'published' as const,
  }

  if (existingTopic.docs[0]) {
    if (isSeedDataCurrent(existingTopic.docs[0], data)) {
      return existingTopic.docs[0]
    }

    return payload.update({
      collection: 'topics',
      data,
      id: existingTopic.docs[0].id,
    })
  }

  return payload.create({
    collection: 'topics',
    data,
  })
}

async function upsertSource(payload: BasePayload, source: CampaignSourceSeed) {
  const existingSource = await payload.find({
    collection: 'sources',
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: source.slug,
      },
    },
  })

  const data = {
    fetchStatus: 'not_fetched' as const,
    language: 'fr',
    parentSource: null,
    platform: source.platform || ('party_site' as const),
    publishedAt: source.publishedAt,
    publisher: source.publisher,
    quote: source.quote,
    rawMetadata: source.rawMetadata,
    references: source.references.map((reference) => ({
      isPrimary: Boolean(reference.isPrimary),
      kind: reference.kind || ('url' as const),
      label: reference.label,
      notes: reference.notes,
      externalId: reference.externalId,
      url: reference.url,
    })),
    notes: source.notes,
    processingStatus: 'queued' as const,
    retrievedAt: seedRetrievedAt,
    slug: source.slug,
    sourceRole: source.sourceRole || ('other' as const),
    submissionStatus: 'internal' as const,
    title: source.title,
    type: source.type,
    verificationStatus: 'verified' as const,
    _status: 'published' as const,
  }

  if (existingSource.docs[0]) {
    return payload.update({
      collection: 'sources',
      data,
      id: existingSource.docs[0].id,
    })
  }

  return payload.create({
    collection: 'sources',
    data,
  })
}

async function upsertParty(payload: BasePayload, party: CampaignPartySeed) {
  const existingParty = await payload.find({
    collection: 'parties',
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: party.slug,
      },
    },
  })

  const data = {
    color: party.color,
    description: party.description,
    name: party.name,
    shortName: party.shortName,
    slug: party.slug,
    sources: [],
    website: party.website,
    _status: 'published' as const,
  }

  if (existingParty.docs[0]) {
    if (isSeedDataCurrent(existingParty.docs[0], data)) {
      return existingParty.docs[0]
    }

    return payload.update({
      collection: 'parties',
      data,
      id: existingParty.docs[0].id,
    })
  }

  return payload.create({
    collection: 'parties',
    data,
  })
}

async function upsertCandidate(
  payload: BasePayload,
  candidate: CampaignCandidateSeed,
  partyID: number,
  sourceIDsBySlug: Map<string, number>,
) {
  const declarationSourceID = sourceIDsBySlug.get(candidate.candidacySourceSlug)

  if (!declarationSourceID) {
    throw new Error(`Missing declaration source ${candidate.candidacySourceSlug}`)
  }

  const candidateSourceIDs = Array.from(
    new Set(
      [candidate.candidacySourceSlug, ...(candidate.sourceSlugs || [])]
        .map((slug) => sourceIDsBySlug.get(slug))
        .filter(Boolean),
    ),
  ) as number[]
  const existingCandidate = await payload.find({
    collection: 'candidates',
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: candidate.slug,
      },
    },
  })

  const data = {
    bio: candidate.bio,
    candidacyStatus: 'declared' as const,
    currentParty: partyID,
    declarationSource: declarationSourceID,
    declaredAt: candidate.declaredAt,
    displayName: candidate.displayName,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    slug: candidate.slug,
    sortOrder: candidate.sortOrder,
    sources: candidateSourceIDs,
    website: candidate.website,
    _status: 'published' as const,
  }

  if (existingCandidate.docs[0]) {
    if (isSeedDataCurrent(existingCandidate.docs[0], data)) {
      return existingCandidate.docs[0]
    }

    return payload.update({
      collection: 'candidates',
      data,
      id: existingCandidate.docs[0].id,
    })
  }

  return payload.create({
    collection: 'candidates',
    data,
  })
}

async function linkSourceToCandidate(payload: BasePayload, sourceID: number, candidateID: number) {
  await payload.update({
    collection: 'sources',
    data: {
      relatedCandidates: [candidateID],
    },
    id: sourceID,
  })
}

async function linkSourceToParent(
  payload: BasePayload,
  source: CampaignSourceSeed,
  sourceIDsBySlug: Map<string, number>,
) {
  if (!source.parentSourceSlug) {
    return
  }

  const sourceID = sourceIDsBySlug.get(source.slug)
  const parentSourceID = sourceIDsBySlug.get(source.parentSourceSlug)

  if (!sourceID || !parentSourceID) {
    throw new Error(`Missing source parent link for ${source.slug}`)
  }

  await payload.update({
    collection: 'sources',
    data: {
      parentSource: parentSourceID,
    },
    id: sourceID,
  })
}

async function upsertProgram(
  payload: BasePayload,
  program: CampaignProgramSeed,
  actorIDsBySlug: Map<string, number>,
  sourceIDsBySlug: Map<string, number>,
) {
  const actorID = actorIDsBySlug.get(program.actor.slug)

  if (!actorID) {
    throw new Error(`Missing program actor ${program.actor.slug}`)
  }

  const sources = program.sources.map((source) => {
    const sourceID = sourceIDsBySlug.get(source.sourceSlug)

    if (!sourceID) {
      throw new Error(`Missing program source ${source.sourceSlug}`)
    }

    return {
      notes: source.notes,
      role: source.role,
      source: sourceID,
    }
  })

  const existingProgram = await payload.find({
    collection: 'programs',
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: program.slug,
      },
    },
  })

  const data = {
    actor: {
      relationTo: program.actor.relationTo,
      value: actorID,
    },
    programDate: program.programDate,
    slug: program.slug,
    sources,
    summary: program.summary,
    title: program.title,
    _status: 'published' as const,
  }

  if (existingProgram.docs[0]) {
    return payload.update({
      collection: 'programs',
      data,
      id: existingProgram.docs[0].id,
    })
  }

  return payload.create({
    collection: 'programs',
    data,
  })
}

export async function seedCampaignContent(payload: BasePayload) {
  const partyIDsBySlug = new Map<string, number>()
  const sourceIDsBySlug = new Map<string, number>()
  const candidateIDsBySlug = new Map<string, number>()

  for (const topic of campaignTopics) {
    await upsertTopic(payload, topic)
  }

  for (const party of campaignParties) {
    const partyDoc = await upsertParty(payload, party)
    partyIDsBySlug.set(party.slug, partyDoc.id)
  }

  for (const source of campaignSources) {
    const sourceDoc = await upsertSource(payload, source)
    sourceIDsBySlug.set(source.slug, sourceDoc.id)
  }

  for (const source of campaignSources) {
    await linkSourceToParent(payload, source, sourceIDsBySlug)
  }

  for (const candidate of campaignCandidates) {
    const partyID = partyIDsBySlug.get(candidate.partySlug)

    if (!partyID) {
      throw new Error(`Missing campaign party for candidate ${candidate.displayName}`)
    }

    const candidateDoc = await upsertCandidate(payload, candidate, partyID, sourceIDsBySlug)
    candidateIDsBySlug.set(candidate.slug, candidateDoc.id)

    for (const sourceSlug of [candidate.candidacySourceSlug, ...(candidate.sourceSlugs || [])]) {
      const sourceID = sourceIDsBySlug.get(sourceSlug)

      if (sourceID) {
        await linkSourceToCandidate(payload, sourceID, candidateDoc.id)
      }
    }
  }

  const actorIDsBySlug = new Map([...partyIDsBySlug, ...candidateIDsBySlug])

  for (const program of campaignPrograms) {
    await upsertProgram(payload, program, actorIDsBySlug, sourceIDsBySlug)
  }

  payload.logger.info('Seeded campaign content: 2027 topics, candidates, sources, and programmes')
}

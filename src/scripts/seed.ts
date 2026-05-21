import { randomUUID } from 'node:crypto'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { hashPassword } from 'better-auth/crypto'
import { getPayload, type BasePayload, type Payload } from 'payload'

import type { User } from '@/payload-types'

import config from '../payload.config'

import {
  campaignCandidates,
  campaignParties,
  campaignPrograms,
  campaignSources,
  type CampaignCandidateSeed,
  type CampaignPartySeed,
  type CampaignProgramSeed,
  type CampaignSourceSeed,
} from './campaign-2027'

type SeedUser = Pick<User, 'email' | 'name'> & {
  role: NonNullable<User['role']>
}

type SeedData = Record<string, unknown>

const seedUser: SeedUser = {
  email: 'yoann.poupart@ens-lyon.org',
  name: 'Yoann Poupart',
  role: ['admin'],
}

const seedRetrievedAt = '2026-05-21T00:00:00.000Z'

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

async function createCredentialAccount(payload: BasePayload, userID: User['id'], password: string) {
  const now = new Date().toISOString()

  await payload.create({
    collection: 'accounts',
    data: {
      accountId: String(userID),
      providerId: 'credential',
      user: userID,
      password: await hashPassword(password),
      createdAt: now,
      updatedAt: now,
    },
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
    processingStatus: 'skipped' as const,
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

async function seedCampaignContent(payload: BasePayload) {
  const partyIDsBySlug = new Map<string, number>()
  const sourceIDsBySlug = new Map<string, number>()
  const candidateIDsBySlug = new Map<string, number>()

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

  payload.logger.info('Seeded campaign content: 2027 candidates, sources, and programmes')
}

async function seedAdminUser(payload: BasePayload) {
  const database = await payload.findGlobal({
    slug: 'database',
  })

  if (database.seeded !== false) {
    payload.logger.info('Database has already been seeded')

    return {
      created: false,
      password: null,
      user: null,
    }
  }

  const existingUser = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    where: {
      email: {
        equals: seedUser.email,
      },
    },
  })

  const existingUserDoc = existingUser.docs[0]

  if (existingUserDoc) {
    const existingAccount = await payload.find({
      collection: 'accounts',
      depth: 0,
      limit: 1,
      where: {
        and: [
          {
            user: {
              equals: existingUserDoc.id,
            },
          },
          {
            providerId: {
              equals: 'credential',
            },
          },
        ],
      },
    })

    const password = existingAccount.docs[0] ? null : randomUUID()

    if (password) {
      await createCredentialAccount(payload, existingUserDoc.id, password)
      payload.logger.info(`Seeded credential account for existing user: ${seedUser.email}`)
      payload.logger.info(`Seed user password: ${password}`)
    }

    await payload.updateGlobal({
      slug: 'database',
      data: {
        seeded: true,
      },
    })

    payload.logger.info(`Seed user already exists: ${seedUser.email}`)

    return {
      created: Boolean(password),
      password,
      user: existingUserDoc,
    }
  }

  const password = randomUUID()
  const createdUser = await payload.create({
    collection: 'users',
    data: {
      ...seedUser,
      emailVerified: false,
    },
  })

  await createCredentialAccount(payload, createdUser.id, password)

  payload.logger.info(`Seeded user: ${seedUser.email}`)
  payload.logger.info(`Seed user password: ${password}`)

  await payload.updateGlobal({
    slug: 'database',
    data: {
      seeded: true,
    },
  })

  return {
    created: true,
    password,
    user: createdUser,
  }
}

export async function seed(payload: BasePayload) {
  const adminResult = await seedAdminUser(payload)

  await seedCampaignContent(payload)

  return adminResult
}

async function runSeedScript() {
  let payload: Payload | undefined

  try {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    await seed(payload)
  } finally {
    await payload?.destroy()
  }
}

const scriptPath = fileURLToPath(import.meta.url)

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  runSeedScript().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}

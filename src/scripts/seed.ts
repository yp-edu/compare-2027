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
  legacy2022CandidateSlugs,
  legacy2022PartySlugs,
  legacy2022SourceURLs,
  type CampaignCandidateSeed,
  type CampaignPartySeed,
  type CampaignSourceSeed,
} from './campaign-2027'

type SeedUser = Pick<User, 'email' | 'name'> & {
  role: NonNullable<User['role']>
}

type SeedData = Record<string, number | number[] | string | undefined>

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
      url: {
        equals: source.url,
      },
    },
  })

  const data = {
    fetchStatus: 'not_fetched' as const,
    language: 'fr',
    platform: source.platform || ('party_site' as const),
    publishedAt: source.publishedAt,
    publisher: source.publisher,
    quote: source.quote,
    notes: source.notes,
    processingStatus: 'skipped' as const,
    retrievedAt: seedRetrievedAt,
    submissionStatus: 'internal' as const,
    title: source.title,
    type: source.type,
    url: source.url,
    verificationStatus: 'verified' as const,
    _status: 'published' as const,
  }

  if (existingSource.docs[0]) {
    if (isSeedDataCurrent(existingSource.docs[0], data)) {
      return existingSource.docs[0]
    }

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
) {
  const source = await upsertSource(payload, candidate.candidacySource)
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
    declarationSource: source.id,
    declaredAt: candidate.declaredAt,
    displayName: candidate.displayName,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    slug: candidate.slug,
    sortOrder: candidate.sortOrder,
    sources: [source.id],
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

async function cleanupLegacy2022Content(payload: BasePayload) {
  await payload.delete({
    collection: 'candidates',
    where: {
      or: legacy2022CandidateSlugs.map((slug) => ({
        slug: {
          equals: slug,
        },
      })),
    },
  })

  await payload.delete({
    collection: 'parties',
    where: {
      or: legacy2022PartySlugs.map((slug) => ({
        slug: {
          equals: slug,
        },
      })),
    },
  })

  const legacySources = await payload.find({
    collection: 'sources',
    depth: 0,
    limit: 100,
    where: {
      or: legacy2022SourceURLs.map((url) => ({
        url: {
          equals: url,
        },
      })),
    },
  })

  const sourceIDs = legacySources.docs.map((source) => source.id)

  if (sourceIDs.length === 0) {
    return
  }

  const sourceWhere = {
    or: sourceIDs.map((sourceID) => ({
      source: {
        equals: sourceID,
      },
    })),
  }

  await payload.delete({
    collection: 'claim-evidence',
    where: sourceWhere,
  })

  await payload.delete({
    collection: 'claims',
    where: {
      or: sourceIDs.map((sourceID) => ({
        primarySource: {
          equals: sourceID,
        },
      })),
    },
  })

  await payload.delete({
    collection: 'document-chunks',
    where: sourceWhere,
  })

  await payload.delete({
    collection: 'source-documents',
    where: sourceWhere,
  })

  await payload.delete({
    collection: 'source-snapshots',
    where: sourceWhere,
  })

  await payload.delete({
    collection: 'sources',
    where: {
      or: sourceIDs.map((id) => ({
        id: {
          equals: id,
        },
      })),
    },
  })

  payload.logger.info('Removed legacy 2022 seed candidates, parties, sources, and documents')
}

async function seedCampaignContent(payload: BasePayload) {
  await cleanupLegacy2022Content(payload)

  const partyIDsBySlug = new Map<string, number>()

  for (const party of campaignParties) {
    const partyDoc = await upsertParty(payload, party)
    partyIDsBySlug.set(party.slug, partyDoc.id)
  }

  for (const candidate of campaignCandidates) {
    const partyID = partyIDsBySlug.get(candidate.partySlug)

    if (!partyID) {
      throw new Error(`Missing campaign party for candidate ${candidate.displayName}`)
    }

    await upsertCandidate(payload, candidate, partyID)
  }

  payload.logger.info('Seeded campaign content: 2027 declared candidates and parties')
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

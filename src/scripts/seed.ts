import { randomUUID } from 'node:crypto'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { hashPassword } from 'better-auth/crypto'
import { getPayload, type BasePayload, type Payload } from 'payload'

import type { User } from '@/payload-types'

import config from '../payload.config'

import {
  cnccepCandidatesSource,
  demoCandidates,
  demoParties,
  getDeclarationURL,
  type DemoCandidateSeed,
  type DemoPartySeed,
} from './demo-2022'

type SeedUser = Pick<User, 'email' | 'name'> & {
  role: NonNullable<User['role']>
}

type SeedData = Record<string, number | number[] | string | undefined>

const seedUser: SeedUser = {
  email: 'yoann.poupart@ens-lyon.org',
  name: 'Yoann Poupart',
  role: ['admin'],
}

const demoRetrievedAt = '2026-05-16T00:00:00.000Z'

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

async function upsertSource(
  payload: BasePayload,
  source: {
    notes?: string
    publisher?: string
    quote?: string
    title: string
    type?: 'official_program' | 'other'
    url: string
  },
) {
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
    platform: 'institution' as const,
    publisher: source.publisher || 'Commission nationale de contrôle de la campagne électorale',
    quote: source.quote,
    notes: source.notes,
    processingStatus: 'skipped' as const,
    retrievedAt: demoRetrievedAt,
    submissionStatus: 'internal' as const,
    title: source.title,
    type: source.type || 'other',
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
    draft: true,
  })
}

async function upsertParty(payload: BasePayload, party: DemoPartySeed, sourceID: number) {
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
    sources: [sourceID],
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
  candidate: DemoCandidateSeed,
  partyID: number,
) {
  const source = await upsertSource(payload, {
    notes:
      'Déclaration de candidat publiée par la CNCCEP pour le premier tour de l’élection présidentielle 2022.',
    publisher: 'Commission nationale de contrôle de la campagne électorale',
    title: `Déclaration 2022 - ${candidate.displayName}`,
    type: 'official_program',
    url: getDeclarationURL(candidate),
  })
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
    bio: `${candidate.displayName} fait partie des 12 candidats du premier tour de l’élection présidentielle française de 2022. Cette fiche sert de corpus de démonstration sourcé pour Compare 2027.`,
    candidacyStatus: 'declared' as const,
    currentParty: partyID,
    displayName: candidate.displayName,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    slug: candidate.slug,
    sortOrder: candidate.sortOrder,
    sources: [source.id],
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

async function seedDemoContent(payload: BasePayload) {
  const indexSource = await upsertSource(payload, {
    notes:
      'Page officielle listant les candidats et leurs déclarations pour le premier tour de l’élection présidentielle 2022.',
    title: cnccepCandidatesSource.title,
    type: 'other',
    url: cnccepCandidatesSource.url,
  })
  const partyIDsBySlug = new Map<string, number>()

  for (const party of demoParties) {
    const partyDoc = await upsertParty(payload, party, indexSource.id)
    partyIDsBySlug.set(party.slug, partyDoc.id)
  }

  for (const candidate of demoCandidates) {
    const partyID = partyIDsBySlug.get(candidate.partySlug)

    if (!partyID) {
      throw new Error(`Missing demo party for candidate ${candidate.displayName}`)
    }

    await upsertCandidate(payload, candidate, partyID)
  }

  payload.logger.info('Seeded demo content: 2022 candidates and parties')
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

  await seedDemoContent(payload)

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

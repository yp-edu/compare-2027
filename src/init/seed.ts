import { randomUUID } from 'node:crypto'

import { hashPassword } from 'better-auth/crypto'
import type { BasePayload } from 'payload'

import type { User } from '@/payload-types'

type SeedUser = Pick<User, 'email' | 'name'> & {
  role: NonNullable<User['role']>
}

const seedUser: SeedUser = {
  email: 'yoann.poupart@ens-lyon.org',
  name: 'Yoann Poupart',
  role: ['admin'],
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

export async function seed(payload: BasePayload) {
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

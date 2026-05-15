import { getPayloadAuth } from 'payload-auth/better-auth'

import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'

import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

const testUserData = {
  email: testUser.email,
  name: 'Test Admin',
  role: ['admin'] as ('admin' | 'editor' | 'user')[],
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  const response = await payload.betterAuth.handler(
    new Request('http://localhost:3000/api/auth/sign-up/email', {
      body: JSON.stringify({
        email: testUser.email,
        name: testUserData.name,
        password: testUser.password,
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    }),
  )

  if (!response.ok) {
    throw new Error(`Failed to seed test user: ${response.status} ${await response.text()}`)
  }

  const result = (await response.json()) as { user: { id: number | string } }

  await payload.update({
    collection: 'users',
    id: result.user.id,
    data: {
      emailVerified: true,
      role: testUserData.role,
    },
    draft: true,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}

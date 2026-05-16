import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

const testUserData = {
  email: testUser.email,
  name: 'Test Admin',
  role: ['admin'] as ('admin' | 'editor' | 'user')[],
}

function getServerURL() {
  return (process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

function getTestEndpointHeaders() {
  const headers: Record<string, string> = {}
  const e2eTestSecret = process.env.E2E_TEST_SECRET
  const vercelProtectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

  if (e2eTestSecret) {
    headers['x-e2e-test-secret'] = e2eTestSecret
  }

  if (vercelProtectionBypass) {
    headers['x-vercel-protection-bypass'] = vercelProtectionBypass
  }

  return headers
}

async function requestTestUserEndpoint(method: 'DELETE' | 'POST') {
  const e2eTestSecret = process.env.E2E_TEST_SECRET

  if (!e2eTestSecret) {
    return false
  }

  const response = await fetch(`${getServerURL()}/api/e2e/test-user`, {
    headers: getTestEndpointHeaders(),
    method,
  })

  if (!response.ok) {
    throw new Error(`Failed to ${method} test user: ${response.status} ${await response.text()}`)
  }

  return true
}

async function getLocalPayload() {
  const { getPayloadAuth } = await import('payload-auth/better-auth')
  const { default: config } = await import('../../src/payload.config.js')

  return getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  if (await requestTestUserEndpoint('POST')) {
    return
  }

  if (process.env.PLAYWRIGHT_BASE_URL) {
    throw new Error('E2E_TEST_SECRET must be configured when testing a deployed preview URL')
  }

  const payload = await getLocalPayload()

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
    new Request(`${getServerURL()}/api/auth/sign-up/email`, {
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
  if (await requestTestUserEndpoint('DELETE')) {
    return
  }

  if (process.env.PLAYWRIGHT_BASE_URL) {
    throw new Error('E2E_TEST_SECRET must be configured when testing a deployed preview URL')
  }

  const payload = await getLocalPayload()

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}

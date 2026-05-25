import { timingSafeEqual } from 'node:crypto'

import config from '@payload-config'
import { getPayloadAuth } from 'payload-auth/better-auth'

import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'
import { getServerURL } from '@/lib/server-urls'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test-password',
}

const testUserData = {
  email: testUser.email,
  name: 'Test Admin',
  role: ['admin'] as ('admin' | 'editor' | 'user')[],
}

function hasValidSecret(request: Request) {
  const configuredSecret = process.env.E2E_TEST_SECRET
  const requestSecret = request.headers.get('x-e2e-test-secret')

  if (!configuredSecret || !requestSecret) {
    return false
  }

  const configuredSecretBuffer = Buffer.from(configuredSecret)
  const requestSecretBuffer = Buffer.from(requestSecret)

  return (
    configuredSecretBuffer.length === requestSecretBuffer.length &&
    timingSafeEqual(configuredSecretBuffer, requestSecretBuffer)
  )
}

function authorize(request: Request) {
  if (process.env.VERCEL_ENV === 'production' || !process.env.E2E_TEST_SECRET) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (!hasValidSecret(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

async function deleteTestUser() {
  const payload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  return payload
}

export async function POST(request: Request) {
  const unauthorizedResponse = authorize(request)

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const payload = await deleteTestUser()
  const response = await payload.betterAuth.handler(
    new Request(new URL('/api/auth/sign-up/email', request.url), {
      body: JSON.stringify({
        email: testUser.email,
        legalConsentAccepted: true,
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
    return Response.json(
      { error: `Failed to seed test user: ${response.status} ${await response.text()}` },
      { status: 500 },
    )
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

  return Response.json({ ok: true, serverURL: getServerURL() })
}

export async function DELETE(request: Request) {
  const unauthorizedResponse = authorize(request)

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  await deleteTestUser()

  return Response.json({ ok: true })
}

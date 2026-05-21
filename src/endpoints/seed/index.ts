import type { Endpoint, PayloadRequest } from 'payload'

import { getAllowedOrigins } from '@/lib/server-urls'

import { seedCampaignContent } from './seed-campaign'

type UserWithRole = {
  id?: number | string
  role?: unknown
}

type PayloadWithBetterAuth = PayloadRequest['payload'] & {
  betterAuth?: {
    api: {
      getSession: (args: {
        headers: Headers
      }) => Promise<{ user?: { id?: number | string } } | null>
    }
  }
}

function hasAdminRole(user: UserWithRole | null | undefined) {
  const role = user?.role

  if (Array.isArray(role)) {
    return role.includes('admin')
  }

  return role === 'admin'
}

function hasAllowedOrigin(request: PayloadRequest) {
  const origin = request.headers.get('origin')?.replace(/\/+$/, '')

  if (!origin) {
    return true
  }

  return new Set([new URL(request.url || '').origin, ...getAllowedOrigins()]).has(origin)
}

async function getAdminUser(req: PayloadRequest) {
  if (hasAdminRole(req.user as UserWithRole | null | undefined)) {
    return req.user as UserWithRole
  }

  const payload = req.payload as PayloadWithBetterAuth
  const session = await payload.betterAuth?.api.getSession({ headers: req.headers })

  if (!session?.user?.id) {
    return null
  }

  return req.payload.findByID({
    collection: 'users',
    depth: 0,
    disableErrors: true,
    id: session.user.id,
    req,
  }) as Promise<UserWithRole | null>
}

export const seedEndpoint: Endpoint = {
  handler: async (req) => {
    if (!hasAllowedOrigin(req)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (req.headers.get('x-admin-action') !== 'seed') {
      return Response.json({ error: 'Invalid seed request' }, { status: 400 })
    }

    const user = await getAdminUser(req)

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!hasAdminRole(user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await seedCampaignContent(req.payload)

    return Response.json({ ok: true })
  },
  method: 'post',
  path: '/admin/seed',
}

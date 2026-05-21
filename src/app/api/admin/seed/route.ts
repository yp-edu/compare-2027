import config from '@payload-config'
import { getPayloadAuth } from 'payload-auth/better-auth'

import { getAllowedOrigins } from '@/lib/server-urls'
import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'
import { seed } from '@/scripts/seed'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type UserWithRole = {
  role?: unknown
}

function hasAdminRole(user: UserWithRole | null | undefined) {
  const role = user?.role

  if (Array.isArray(role)) {
    return role.includes('admin')
  }

  return role === 'admin'
}

function hasAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin')?.replace(/\/+$/, '')

  if (!origin) {
    return true
  }

  return new Set([new URL(request.url).origin, ...getAllowedOrigins()]).has(origin)
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (request.headers.get('x-admin-action') !== 'seed') {
    return Response.json({ error: 'Invalid seed request' }, { status: 400 })
  }

  const payload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)
  const session = await payload.betterAuth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const user = await payload.findByID({
    collection: 'users',
    depth: 0,
    disableErrors: true,
    id: session.user.id,
  })

  if (!hasAdminRole(user)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result = await seed(payload)

  return Response.json({
    adminUserCreated: result.created,
    ok: true,
  })
}

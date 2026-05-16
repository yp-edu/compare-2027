import config from '@payload-config'
import { getPayload } from 'payload'
import { getPayloadAuth } from 'payload-auth/better-auth'

import { createLegalConsentAudit } from '@/features/legal/server'
import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'

export async function POST(request: Request) {
  const authPayload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)
  const session = await authPayload.betterAuth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: { accepted?: unknown }

  try {
    body = (await request.json()) as { accepted?: unknown }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Malformed JSON payload' }, { status: 400 })
    }

    throw error
  }

  if (body.accepted !== true) {
    return Response.json({ error: 'Legal consent required' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const accounts = await payload.find({
    collection: 'accounts',
    depth: 0,
    limit: 20,
    select: {
      providerId: true,
    },
    where: {
      user: {
        equals: session.user.id,
      },
    },
  })

  const providerIds = accounts.docs
    .map((account) => account.providerId)
    .filter((providerId): providerId is string => Boolean(providerId))

  await payload.update({
    collection: 'users',
    data: createLegalConsentAudit(request.headers, providerIds),
    id: session.user.id,
  })

  return Response.json({ ok: true })
}

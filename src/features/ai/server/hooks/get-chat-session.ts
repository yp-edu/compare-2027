import { getPayloadAuth } from 'payload-auth/better-auth'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { isLegalConsentCurrent } from '@/lib/legal'
import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'

export async function getChatSession(request: Request) {
  const payload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)

  return payload.betterAuth.api.getSession({
    headers: request.headers,
  })
}

export async function requireChatSession(request: Request) {
  const session = await getChatSession(request)

  if (!session?.user) {
    return null
  }

  if (!session.user.emailVerified) {
    return null
  }

  const payload = await getPayload({ config })
  const user = await payload.findByID({
    collection: 'users',
    depth: 0,
    disableErrors: true,
    id: session.user.id,
  })

  if (!isLegalConsentCurrent(user)) {
    return null
  }

  return session
}

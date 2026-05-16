import { getPayloadAuth } from 'payload-auth/better-auth'

import config from '@/payload.config'
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

  return session
}

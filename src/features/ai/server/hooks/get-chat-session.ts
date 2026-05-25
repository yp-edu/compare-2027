import { getPayloadAuth } from 'payload-auth/better-auth'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { isLegalConsentCurrent } from '@/lib/legal'
import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'

type ChatSessionRejectionReason =
  | 'email-not-verified'
  | 'legal-consent-missing'
  | 'missing-session'
  | 'user-not-found'

type RequireChatSessionOptions = {
  requestId?: string
}

function logChatSessionRejection(
  reason: ChatSessionRejectionReason,
  context?: Record<string, unknown>,
) {
  console.warn('[compare-chat]', {
    ...context,
    reason,
    stage: 'auth-session',
  })
}

export async function getChatSession(request: Request) {
  const payload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)

  return payload.betterAuth.api.getSession({
    headers: request.headers,
  })
}

export async function requireChatSession(
  request: Request,
  options: RequireChatSessionOptions = {},
) {
  const session = await getChatSession(request)

  if (!session?.user) {
    logChatSessionRejection('missing-session', {
      requestId: options.requestId,
    })

    return null
  }

  if (!session.user.emailVerified) {
    logChatSessionRejection('email-not-verified', {
      requestId: options.requestId,
      userId: session.user.id,
    })

    return null
  }

  const payload = await getPayload({ config })
  const user = await payload.findByID({
    collection: 'users',
    depth: 0,
    disableErrors: true,
    id: session.user.id,
  })

  if (!user) {
    logChatSessionRejection('user-not-found', {
      requestId: options.requestId,
      userId: session.user.id,
    })

    return null
  }

  if (!isLegalConsentCurrent(user)) {
    logChatSessionRejection('legal-consent-missing', {
      hasLegalConsentAcceptedAt: Boolean(user.legalConsentAcceptedAt),
      legalConsentVersion: user.legalConsentVersion,
      requestId: options.requestId,
      userId: session.user.id,
    })

    return null
  }

  return session
}

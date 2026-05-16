import { createHash } from 'crypto'

import { LEGAL_CONSENT_VERSION } from '@/lib/legal'

export type LegalConsentAudit = {
  legalConsentAcceptedAt: string
  legalConsentIpHash: string | null
  legalConsentProviderIds: string
  legalConsentUserAgent: string | null
  legalConsentVersion: string
}

function getHeader(headers: Headers | undefined, name: string) {
  return headers?.get(name) || null
}

export function getClientIp(headers: Headers | undefined) {
  const forwardedFor = getHeader(headers, 'x-forwarded-for')
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim()

  return (
    firstForwardedIp ||
    getHeader(headers, 'x-real-ip') ||
    getHeader(headers, 'cf-connecting-ip') ||
    getHeader(headers, 'x-vercel-forwarded-for')
  )
}

export function hashClientIp(ip: string | null) {
  if (!ip) {
    return null
  }

  const salt =
    process.env.LEGAL_CONSENT_IP_HASH_SALT ||
    process.env.BETTER_AUTH_SECRET ||
    process.env.PAYLOAD_SECRET

  if (!salt) {
    return null
  }

  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

export function createLegalConsentAudit(headers: Headers | undefined, providerIds: string[]) {
  return {
    legalConsentAcceptedAt: new Date().toISOString(),
    legalConsentIpHash: hashClientIp(getClientIp(headers)),
    legalConsentProviderIds: providerIds.filter(Boolean).join(','),
    legalConsentUserAgent: getHeader(headers, 'user-agent'),
    legalConsentVersion: LEGAL_CONSENT_VERSION,
  } satisfies LegalConsentAudit
}

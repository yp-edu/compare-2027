export const LEGAL_CONSENT_VERSION = '2026-05-16'

export const GITHUB_REPOSITORY_URL = 'https://github.com/yp-edu/compare-2027'

export const legalLinks = [
  { href: '/cgu', label: 'CGU' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/neutralite', label: 'Neutralité' },
] as const

export type LegalConsentFields = {
  legalConsentAcceptedAt?: string | null
  legalConsentVersion?: string | null
}

export function isLegalConsentCurrent(user?: unknown) {
  const consent = user as LegalConsentFields | null | undefined

  return Boolean(
    consent?.legalConsentAcceptedAt && consent.legalConsentVersion === LEGAL_CONSENT_VERSION,
  )
}

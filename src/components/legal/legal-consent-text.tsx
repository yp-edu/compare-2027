import Link from 'next/link'

const legalConsentLinks = {
  confidentiality: '/confidentialite',
  neutrality: '/neutralite',
  terms: '/cgu',
} as const

type LegalConsentTextProps = {
  linkClassName?: string
}

export function LegalConsentText({
  linkClassName = 'font-semibold text-primary underline-offset-4 hover:underline',
}: LegalConsentTextProps) {
  return (
    <>
      J’accepte les{' '}
      <Link className={linkClassName} href={legalConsentLinks.terms}>
        CGU
      </Link>
      , la{' '}
      <Link className={linkClassName} href={legalConsentLinks.confidentiality}>
        politique de confidentialité
      </Link>{' '}
      et la{' '}
      <Link className={linkClassName} href={legalConsentLinks.neutrality}>
        charte de neutralité
      </Link>
      .
    </>
  )
}

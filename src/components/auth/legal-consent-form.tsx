'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { LegalConsentText } from '@/components/legal/legal-consent-text'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

type LegalConsentFormProps = {
  nextPath: string
}

export function LegalConsentForm({ nextPath }: LegalConsentFormProps) {
  const router = useRouter()
  const { refetch } = authClient.useSession()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    if (formData.get('legalConsentAccepted') !== 'on') {
      setIsSubmitting(false)
      setError('Vous devez accepter les documents pour continuer.')
      return
    }

    try {
      const response = await fetch('/api/legal-consent', {
        body: JSON.stringify({ accepted: true }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) {
        setError('Le consentement n’a pas pu être enregistré. Veuillez réessayer.')
        return
      }

      await refetch({ query: { disableCookieCache: true } })
      router.push(nextPath)
      router.refresh()
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="flex items-start gap-3 rounded-xl border border-border bg-background/65 p-3 text-sm leading-6 text-muted-foreground">
        <input
          className="mt-1 size-4 rounded border-input accent-primary"
          name="legalConsentAccepted"
          required
          type="checkbox"
        />
        <span>
          <LegalConsentText />
        </span>
      </label>
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      <Button aria-busy={isSubmitting} className="w-full" disabled={isSubmitting} size="lg">
        {isSubmitting ? 'Enregistrement...' : 'Confirmer et continuer'}
      </Button>
    </form>
  )
}

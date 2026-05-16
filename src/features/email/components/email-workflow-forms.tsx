'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'

type EndpointError = {
  code?: string
  message?: string
}

type ForgotPasswordFormProps = {
  initialEmail?: string
}

type ResetPasswordFormProps = {
  initialError?: string | null
  token?: string | null
}

type VerificationEmailFormProps = {
  initialEmail?: string
  initialSuccessMessage?: string
}

const endpointErrorMessages: Record<string, string> = {
  email_already_verified: 'Cette adresse e-mail est déjà vérifiée.',
  email_mismatch: 'Cette adresse e-mail ne correspond pas à la session active.',
  invalid_email: 'Veuillez saisir une adresse e-mail valide.',
  invalid_token: 'Ce lien est invalide ou a expiré. Demandez un nouveau lien.',
  password_too_long: 'Ce mot de passe est trop long.',
  password_too_short: 'Ce mot de passe est trop court.',
  reset_password_disabled: 'La réinitialisation du mot de passe est indisponible.',
  token_expired: 'Ce lien a expiré. Demandez un nouveau lien.',
  verification_email_not_enabled: 'La vérification par e-mail est indisponible.',
}

const networkErrorMessage =
  'Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.'

function normalizeEndpointError(value?: string | null) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function getEndpointErrorMessage(
  error?: EndpointError | string | null,
  fallback = 'Impossible de terminer cette action.',
) {
  const code = typeof error === 'string' ? error : error?.code
  const message = typeof error === 'string' ? error : error?.message
  const candidates = [normalizeEndpointError(code), normalizeEndpointError(message)]

  for (const candidate of candidates) {
    if (candidate && endpointErrorMessages[candidate]) {
      return endpointErrorMessages[candidate]
    }
  }

  return message || fallback
}

async function getResponseError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as EndpointError

    return getEndpointErrorMessage(body, fallback)
  } catch {
    return fallback
  }
}

function StatusMessage({ children, type }: { children: string; type: 'error' | 'success' }) {
  return (
    <p
      className={
        type === 'error'
          ? 'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive'
          : 'rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary'
      }
    >
      {children}
    </p>
  )
}

export function ForgotPasswordForm({ initialEmail = '' }: ForgotPasswordFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '')

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        body: JSON.stringify({
          email,
          redirectTo: '/reset-password',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        setError(
          await getResponseError(response, 'Impossible d’envoyer le lien de réinitialisation.'),
        )
        return
      }

      setSuccess(true)
    } catch {
      setError(networkErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2 text-sm font-semibold">
        <span>Email</span>
        <input
          className="h-11 w-full rounded-lg border border-input bg-background/80 px-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          name="email"
          required
          type="email"
          autoComplete="email"
          defaultValue={initialEmail}
          placeholder="vous@example.com"
        />
      </label>
      {success ? (
        <StatusMessage type="success">
          Si un compte existe avec cette adresse, un lien de réinitialisation vient d’être envoyé.
        </StatusMessage>
      ) : null}
      {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
      <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
      </Button>
    </form>
  )
}

export function ResetPasswordForm({ initialError, token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(() =>
    initialError ? getEndpointErrorMessage(initialError) : null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setError('Ce lien est invalide ou a expiré. Demandez un nouveau lien.')
      return
    }

    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)
    const newPassword = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        body: JSON.stringify({
          newPassword,
          token,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        setError(await getResponseError(response, 'Impossible de réinitialiser ce mot de passe.'))
        return
      }

      setSuccess(true)
    } catch {
      setError(networkErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2 text-sm font-semibold">
        <span>Nouveau mot de passe</span>
        <input
          className="h-11 w-full rounded-lg border border-input bg-background/80 px-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          name="password"
          required
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </label>
      <label className="block space-y-2 text-sm font-semibold">
        <span>Confirmer le mot de passe</span>
        <input
          className="h-11 w-full rounded-lg border border-input bg-background/80 px-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          name="confirmPassword"
          required
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </label>
      {success ? (
        <StatusMessage type="success">Votre mot de passe a été réinitialisé.</StatusMessage>
      ) : null}
      {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
      <Button
        className="w-full"
        disabled={isSubmitting || !token || success}
        size="lg"
        type="submit"
      >
        {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
      </Button>
      {success ? (
        <Button asChild className="w-full" size="lg" variant="outline">
          <Link href="/signin">Se connecter</Link>
        </Button>
      ) : null}
    </form>
  )
}

const verificationEmailSuccessMessage =
  'Si un compte non vérifié existe avec cette adresse, un e-mail de vérification vient d’être envoyé.'

export function VerificationEmailForm({
  initialEmail = '',
  initialSuccessMessage,
}: VerificationEmailFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(initialSuccessMessage ?? null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '')

    try {
      const response = await fetch('/api/auth/send-verification-email', {
        body: JSON.stringify({
          callbackURL: '/compare',
          email,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        setError(await getResponseError(response, 'Impossible d’envoyer l’e-mail de vérification.'))
        return
      }

      setSuccessMessage(verificationEmailSuccessMessage)
    } catch {
      setError(networkErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2 text-sm font-semibold">
        <span>Email</span>
        <input
          className="h-11 w-full rounded-lg border border-input bg-background/80 px-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          name="email"
          required
          type="email"
          autoComplete="email"
          defaultValue={initialEmail}
          placeholder="vous@example.com"
        />
      </label>
      {successMessage ? <StatusMessage type="success">{successMessage}</StatusMessage> : null}
      {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
      <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? 'Envoi...' : 'Renvoyer l’e-mail'}
      </Button>
    </form>
  )
}

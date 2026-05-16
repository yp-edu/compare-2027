'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

type AuthFormProps = {
  enableGoogle?: boolean
  initialError?: string | null
  mode: 'signin' | 'signup'
}

type AuthClientError = {
  code?: string
  message?: string
}

const authErrorMessages: Record<string, string> = {
  account_already_linked_to_different_user:
    'Ce compte Google est déjà associé à un autre utilisateur.',
  account_not_linked:
    'Un compte existe déjà avec cette adresse e-mail, mais il n’est pas encore associé à Google. Connectez-vous avec votre e-mail et votre mot de passe.',
  email_doesnt_match: 'L’adresse e-mail Google ne correspond pas à celle de votre compte.',
  email_not_found: 'Google n’a pas fourni d’adresse e-mail pour ce compte.',
  email_not_verified: 'Votre adresse e-mail doit être vérifiée avant de continuer.',
  invalid_code: 'La connexion Google a expiré. Veuillez réessayer.',
  invalid_email: 'Veuillez saisir une adresse e-mail valide.',
  invalid_email_or_password: 'Adresse e-mail ou mot de passe incorrect.',
  no_code: 'La connexion Google n’a pas pu être finalisée. Veuillez réessayer.',
  oauth_provider_not_found: 'La connexion Google est indisponible pour le moment.',
  please_restart_the_process: 'La connexion a expiré. Veuillez recommencer.',
  signup_disabled: 'La création de compte est indisponible pour cette méthode de connexion.',
  state_mismatch: 'La session de connexion a expiré. Veuillez recommencer.',
  unable_to_get_user_info: 'Impossible de récupérer les informations de votre compte Google.',
  unable_to_link_account:
    'Impossible d’associer ce compte Google. Connectez-vous avec votre e-mail et votre mot de passe.',
  user_already_exists:
    'Un compte existe déjà avec cette adresse e-mail. Connectez-vous plutôt avec vos identifiants.',
  user_already_exists_use_another_email:
    'Un compte existe déjà avec cette adresse e-mail. Utilisez une autre adresse ou connectez-vous.',
}

function normalizeAuthError(value?: string | null) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function getAuthErrorMessage(
  error?: AuthClientError | string | null,
  fallback = 'Impossible de terminer cette action.',
) {
  const code = typeof error === 'string' ? error : error?.code
  const message = typeof error === 'string' ? error : error?.message
  const candidates = [normalizeAuthError(code), normalizeAuthError(message)]

  for (const candidate of candidates) {
    if (candidate && authErrorMessages[candidate]) {
      return authErrorMessages[candidate]
    }
  }

  return message || fallback
}

export function AuthForm({ enableGoogle = false, initialError, mode }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(() => getAuthErrorMessage(initialError, ''))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  async function handleGoogleAuth() {
    setError(null)
    setIsGoogleSubmitting(true)

    const result = await authClient.signIn.social({
      callbackURL: '/compare',
      errorCallbackURL: mode === 'signup' ? '/signup' : '/signin',
      provider: 'google',
      requestSignUp: mode === 'signup',
    })

    setIsGoogleSubmitting(false)

    if (result.error) {
      setError(getAuthErrorMessage(result.error, 'Impossible de continuer avec Google.'))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')
    const name = String(formData.get('name') || '')

    const result =
      mode === 'signup'
        ? await authClient.signUp.email({ email, name, password })
        : await authClient.signIn.email({ email, password })

    setIsSubmitting(false)

    if (result.error) {
      setError(getAuthErrorMessage(result.error))
      return
    }

    router.push('/compare')
    router.refresh()
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {mode === 'signup' ? (
        <label className="block space-y-2 text-sm font-semibold">
          <span>Nom</span>
          <input
            className="h-11 w-full rounded-lg border border-input bg-background/80 px-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
            name="name"
            required
            type="text"
            autoComplete="name"
            placeholder="Votre nom"
          />
        </label>
      ) : null}
      <label className="block space-y-2 text-sm font-semibold">
        <span>Email</span>
        <input
          className="h-11 w-full rounded-lg border border-input bg-background/80 px-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          name="email"
          required
          type="email"
          autoComplete="email"
          placeholder="vous@example.com"
        />
      </label>
      <label className="block space-y-2 text-sm font-semibold">
        <span>Mot de passe</span>
        <input
          className="h-11 w-full rounded-lg border border-input bg-background/80 px-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          name="password"
          required
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          placeholder="••••••••"
        />
      </label>
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        className="w-full"
        disabled={isSubmitting || isGoogleSubmitting}
        size="lg"
        type="submit"
      >
        {isSubmitting
          ? 'Veuillez patienter...'
          : mode === 'signup'
            ? 'Créer mon compte'
            : 'Se connecter'}
      </Button>
      {enableGoogle ? (
        <>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="bg-card px-3">ou</span>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={isSubmitting || isGoogleSubmitting}
            onClick={handleGoogleAuth}
            size="lg"
            type="button"
            variant="outline"
          >
            {isGoogleSubmitting ? 'Redirection...' : 'Continuer avec Google'}
          </Button>
        </>
      ) : null}
    </form>
  )
}

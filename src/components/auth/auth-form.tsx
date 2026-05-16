'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

type AuthFormProps = {
  mode: 'signin' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      setError(result.error.message || 'Impossible de terminer cette action.')
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
      <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting
          ? 'Veuillez patienter...'
          : mode === 'signup'
            ? 'Créer mon compte'
            : 'Se connecter'}
      </Button>
    </form>
  )
}
